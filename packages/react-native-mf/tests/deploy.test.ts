/**
 * `deploy` · `rollback` — 메모리 저장소에 실제로 구운 번들을 올린다.
 *
 * 픽스처 자리는 `cli-build.test.ts` 와 같은 이유로 패키지 안 · `node_modules` 밖이다.
 */
import assert from 'node:assert/strict'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { after, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { type DeployConfig, type DeployStorage, loadConfig } from '../src/deploy/config'
import { runDeploy, runRollback } from '../src/deploy/deploy'
import { parseManifest } from '../src/manifest'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = join(here, '../.tmp-deploy-test')

async function write(relativePath: string, contents: string): Promise<void> {
  const target = join(projectDir, relativePath)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, contents)
}

const source = (label: string) =>
  [
    "import { useState } from 'react'",
    "import { View } from 'react-native'",
    `export default { useState, View, label: '${label}' }`,
    '',
  ].join('\n')

async function setVersion(version: string): Promise<void> {
  await write('package.json', JSON.stringify({ name: 'mini', version }))
}

await rm(projectDir, { recursive: true, force: true })
await write('babel.config.cjs', "module.exports = { presets: ['@babel/preset-typescript'] }\n")
await write('host-shared.json', JSON.stringify(['react', 'react/jsx-runtime', 'react-native']))
after(() => rm(projectDir, { recursive: true, force: true }))

type Written = { key: string; body: string; cacheControl: string }

function memoryStorage(failManifestWrites = 0) {
  const files = new Map<string, string>()
  const writes: Written[] = []
  let failures = failManifestWrites
  const storage: DeployStorage = {
    async read(key) {
      return files.get(key) ?? null
    },
    async write(key, body, meta) {
      if (key.endsWith('manifest.json') && failures > 0) {
        failures -= 1
        throw new Error('network down')
      }
      files.set(key, body)
      writes.push({ key, body, cacheControl: meta.cacheControl })
    },
  }
  return { storage, files, writes }
}

const configWith = (storage: DeployStorage): DeployConfig => ({
  name: 'settings',
  prefix: 'apps',
  storage,
  build: { sharedFrom: 'host-shared.json', outFile: 'build/out/index.bundle.js' },
})

const manifestOf = (files: Map<string, string>, channel: string) =>
  parseManifest(files.get(`apps/settings/${channel}/manifest.json`) ?? '', channel)

beforeEach(async () => {
  await write('src/index.ts', source('one'))
  await setVersion('1.2.0')
})

test('첫 배포는 번들을 길게, 매니페스트를 짧게 캐시해 올리고 실제 import 를 requires 로 남긴다', async () => {
  const { storage, files, writes } = memoryStorage()
  const result = await runDeploy({
    cwd: projectDir,
    channel: 'staging',
    config: configWith(storage),
  })

  assert.equal(result.uploaded, true)
  assert.deepEqual(result.requires, ['react', 'react-native'])
  assert.deepEqual(
    writes.map(({ key, cacheControl }) => [key, cacheControl]),
    [
      ['apps/settings/1.2.0/index.bundle.js', 'public, max-age=31536000, immutable'],
      ['apps/settings/staging/manifest.json', 'public, max-age=60'],
    ],
  )
  const [release] = manifestOf(files, 'staging').releases
  assert.deepEqual(
    [release.version, release.enabled, release.requires],
    ['1.2.0', true, ['react', 'react-native']],
  )
})

test('같은 채널에 같은 버전은 굽기 전에 거절한다', async () => {
  const { storage, writes } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) }),
    /이미 이 채널에 있다/,
  )
  assert.equal(writes.length, 2)
})

test('다른 채널로 올리면 같은 번들을 다시 쓰고 매니페스트만 더한다', async () => {
  const { storage, files } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  const result = await runDeploy({
    cwd: projectDir,
    channel: 'production',
    config: configWith(storage),
  })

  assert.equal(result.uploaded, false)
  assert.deepEqual(
    manifestOf(files, 'production').releases.map((r) => r.version),
    ['1.2.0'],
  )
})

test('버전을 안 올리고 소스를 바꾸면 다른 채널에서도 거절한다', async () => {
  const { storage } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await write('src/index.ts', source('two'))
  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'production', config: configWith(storage) }),
    /다른 내용이 이미 있다/,
  )
})

test('매니페스트 쓰기에서 죽어도 다시 돌리면 끝난다', async () => {
  const { storage, files } = memoryStorage(1)
  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) }),
    /network down/,
  )
  const retry = await runDeploy({
    cwd: projectDir,
    channel: 'staging',
    config: configWith(storage),
  })

  assert.equal(retry.uploaded, false)
  assert.deepEqual(
    manifestOf(files, 'staging').releases.map((r) => r.version),
    ['1.2.0'],
  )
})

test('rollback 은 번들을 남기고 매니페스트에서 최신을 끈다', async () => {
  const { storage, files } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await write('src/index.ts', source('two'))
  await setVersion('1.2.1')
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })

  await runRollback({ channel: 'staging', config: configWith(storage) })

  const releases = manifestOf(files, 'staging').releases
  assert.deepEqual(
    releases.map((r) => [r.version, r.enabled]),
    [
      ['1.2.1', false],
      ['1.2.0', true],
    ],
  )
  assert.ok(files.has('apps/settings/1.2.1/index.bundle.js'), '되돌린 번들이 지워졌다')
})

test('다른 미니앱의 매니페스트 자리면 거절한다', async () => {
  const { storage } = memoryStorage()
  await storage.write('apps/settings/staging/manifest.json', '{"name":"other","releases":[]}', {
    contentType: 'application/json',
    cacheControl: '',
  })
  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) }),
    /"other" 의 매니페스트다/,
  )
})

test('config 는 default export 를 읽고, 없으면 찾은 후보를 댄다', async () => {
  await write('react-native-mf.config.mjs', "export default { name: 'settings', prefix: 'apps' }\n")
  assert.equal((await loadConfig(projectDir)).name, 'settings')
  await assert.rejects(loadConfig(join(projectDir, 'src')), /config 를 찾을 수 없다/)
})
