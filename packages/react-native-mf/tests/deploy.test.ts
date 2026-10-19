/**
 * `deploy` · `rollback` — 메모리 저장소에 실제로 구운 번들을 올린다.
 *
 * 픽스처 자리는 `cli-build.test.ts` 와 같은 이유로 패키지 안 · `node_modules` 밖이다.
 */
import assert from 'node:assert/strict'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { after, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { type DeployConfig, type DeployStorage, loadConfig } from '../src/deploy/config'
import { runDeploy, runPromote, runRollback } from '../src/deploy/deploy'
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

test('경로 칸에 못 쓰는 버전은 굽기 전에 거절한다', async () => {
  await rm(join(projectDir, 'build'), { recursive: true, force: true })
  await setVersion('1.2.0+build.1')
  const { storage, writes } = memoryStorage()

  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) }),
    /version 은 경로 한 칸/,
  )
  assert.equal(writes.length, 0)
  await assert.rejects(stat(join(projectDir, 'build/out/index.bundle.js')), /ENOENT/)
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

test('번들에 비밀 값이 보이면 아무것도 올리지 않고, allow 에 적으면 올린다', async () => {
  const key = `AKIA${'Q'.repeat(16)}`
  await write('src/index.ts', source(key))

  const blocked = memoryStorage()
  await assert.rejects(
    runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(blocked.storage) }),
    /비밀 값으로 보이는 문자열/,
  )
  assert.equal(blocked.writes.length, 0)

  const allowed = memoryStorage()
  const result = await runDeploy({
    cwd: projectDir,
    channel: 'staging',
    config: { ...configWith(allowed.storage), scan: { allow: [key] } },
  })
  assert.equal(result.uploaded, true)
})

test('config 는 default export 를 읽고, 없으면 찾은 후보를 댄다', async () => {
  await write('react-native-mf.config.mjs', "export default { name: 'settings', prefix: 'apps' }\n")
  assert.equal((await loadConfig(projectDir)).name, 'settings')
  await assert.rejects(loadConfig(join(projectDir, 'src')), /config 를 찾을 수 없다/)
})

test('promote 는 굽지 않고 다른 채널의 릴리스를 그대로 더한다 — 소스가 바뀐 뒤에도', async () => {
  const { storage, files, writes } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  const staged = manifestOf(files, 'staging').releases[0]
  await write('src/index.ts', source('changed after staging'))
  await setVersion('1.3.0')
  const before = writes.length

  const result = await runPromote({
    from: 'staging',
    channel: 'production',
    config: configWith(storage),
    now: new Date('2026-10-20T00:00:00.000Z'),
  })

  assert.equal(result?.version, '1.2.0')
  assert.deepEqual(
    writes.slice(before).map((w) => w.key),
    ['apps/settings/production/manifest.json'],
  )
  assert.deepEqual(manifestOf(files, 'production').releases, [
    { ...staged, deployedAt: '2026-10-20T00:00:00.000Z' },
  ])
})

test('promote --version 은 그 버전을, 없으면 켜진 최신을 올린다. 꺼진 버전은 거절한다', async () => {
  const { storage, files } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await write('src/index.ts', source('two'))
  await setVersion('1.2.1')
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await runRollback({ channel: 'staging', config: configWith(storage) })

  await assert.rejects(
    runPromote({
      from: 'staging',
      channel: 'production',
      config: configWith(storage),
      version: '1.2.1',
    }),
    /꺼져 있다/,
  )
  const latest = await runPromote({
    from: 'staging',
    channel: 'production',
    config: configWith(storage),
  })
  assert.equal(latest?.version, '1.2.0')
  assert.deepEqual(
    manifestOf(files, 'production').releases.map((r) => r.version),
    ['1.2.0'],
  )
})

test('promote 는 이미 있는 버전 · 없는 번들 · 확인 거절이면 매니페스트를 쓰지 않는다', async () => {
  const { storage, files, writes } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  const config = configWith(storage)

  assert.equal(
    await runPromote({
      from: 'staging',
      channel: 'production',
      config,
      confirm: async () => false,
    }),
    null,
  )
  assert.ok(!files.has('apps/settings/production/manifest.json'), '거절했는데 썼다')

  await runPromote({ from: 'staging', channel: 'production', config })
  await assert.rejects(
    runPromote({ from: 'staging', channel: 'production', config }),
    /이미 production 에 있다/,
  )

  files.delete('apps/settings/1.2.0/index.bundle.js')
  const before = writes.length
  await assert.rejects(runPromote({ from: 'staging', channel: 'beta', config }), /저장소에 없다/)
  assert.equal(writes.length, before)
})

test('promote 대상 채널에서 꺼진 버전이면 다시 켜는 rollback --to 를 알려준다', async () => {
  const { storage } = memoryStorage()
  await runDeploy({ cwd: projectDir, channel: 'staging', config: configWith(storage) })
  await storage.write(
    'apps/settings/production/manifest.json',
    JSON.stringify({
      name: 'settings',
      releases: [
        { version: '1.2.0', requires: [], enabled: false, deployedAt: 'x' },
        { version: '1.1.0', requires: [], enabled: true, deployedAt: 'x' },
      ],
    }),
    { contentType: 'application/json', cacheControl: '' },
  )

  await assert.rejects(
    runPromote({ from: 'staging', channel: 'production', config: configWith(storage) }),
    /꺼져 있다\. 다시 켜려면 rollback -c production --to 1\.2\.0/,
  )
})
