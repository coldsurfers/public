import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runBuild } from '../cli/build'
import { readSharedManifest } from '../cli/shared-manifest'
import { DEFAULT_SHARED_MODULES } from '../esbuild/shared-scope'
import {
  addRelease,
  bundleKey,
  emptyManifest,
  type Manifest,
  manifestKey,
  parseManifest,
  rollback,
} from '../manifest'
import type { DeployConfig, DeployStorage } from './config'
import { formatFindings, scanBundle } from './scan'

/** 버전마다 경로가 달라서 한 번 올린 번들은 바뀌지 않는다 */
const BUNDLE_CACHE = 'public, max-age=31536000, immutable'
/** 배포 · 되돌리기가 1분 안에 호스트에 닿는다. CDN 무효화를 하지 않는 대가다 */
const MANIFEST_CACHE = 'public, max-age=60'

export type DeployResult = {
  version: string
  requires: string[]
  bundleKey: string
  manifestKey: string
  /** `false` 면 다른 채널에서 같은 내용으로 이미 올라가 있어 다시 올리지 않았다 */
  uploaded: boolean
}

async function readManifest(storage: DeployStorage, key: string, name: string) {
  const text = await storage.read(key)
  const manifest = text === null ? emptyManifest(name) : parseManifest(text, key)
  if (manifest.name !== name) {
    throw new Error(
      `[react-native-mf] ${key} 는 "${manifest.name}" 의 매니페스트다(config: "${name}").`,
    )
  }
  return manifest
}

function writeManifest(storage: DeployStorage, key: string, manifest: Manifest) {
  return storage.write(key, `${JSON.stringify(manifest, null, 2)}\n`, {
    contentType: 'application/json',
    cacheControl: MANIFEST_CACHE,
  })
}

export async function readPackageVersion(cwd: string): Promise<string> {
  const { version } = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf8')) as {
    version?: unknown
  }
  if (typeof version !== 'string') {
    throw new Error(`[react-native-mf] ${cwd}/package.json 에 version 이 없다.`)
  }
  return version
}

/**
 * `package.json` 버전으로 굽고 올린다. 번들 → 매니페스트 순서라 중간에 죽어도 다시 돌리면 된다 —
 * 매니페스트에 없는 버전은 호스트가 모르고, 같은 내용의 번들은 다시 올리지 않는다.
 */
export async function runDeploy(input: {
  cwd: string
  channel: string
  config: DeployConfig
  now?: Date
}): Promise<DeployResult> {
  const { cwd, channel, config } = input
  const version = await readPackageVersion(cwd)
  const mKey = manifestKey(config.prefix, config.name, channel)
  const manifest = await readManifest(config.storage, mKey, config.name)
  // 굽기 전에 막는다. 같은 버전을 다시 내려는 건 대개 버전 올리기를 잊은 것이다.
  // 버전이 경로 칸 규칙에 안 맞는 것도 `bundleKey` 가 여기서 던진다
  addRelease(manifest, { version, requires: [], enabled: true, deployedAt: '' })
  const bKey = bundleKey(config.prefix, config.name, version)

  const build = config.build ?? {}
  const shared = build.sharedFrom
    ? await readSharedManifest(resolve(cwd, build.sharedFrom))
    : (build.shared ?? DEFAULT_SHARED_MODULES)
  const { outFile, requires } = await runBuild({
    cwd,
    name: config.name,
    src: build.src ?? 'src',
    entry: build.entry ?? 'index.ts',
    outFile: build.outFile ?? 'build/out/index.bundle.js',
    shared,
    babelConfig: build.babelConfig,
    blockScoping: build.blockScoping ?? true,
  })
  const code = await readFile(outFile, 'utf8')
  const findings = scanBundle(code, config.scan?.allow)
  if (findings.length > 0) throw new Error(formatFindings(outFile, findings))

  const stored = await config.storage.read(bKey)
  if (stored !== null && stored !== code) {
    throw new Error(
      `[react-native-mf] ${bKey} 에 다른 내용이 이미 있다. 번들은 버전마다 한 번만 올린다 — 버전을 올린다.`,
    )
  }
  if (stored === null) {
    await config.storage.write(bKey, code, {
      contentType: 'application/javascript',
      cacheControl: BUNDLE_CACHE,
    })
  }

  await writeManifest(
    config.storage,
    mKey,
    addRelease(manifest, {
      version,
      requires,
      enabled: true,
      deployedAt: (input.now ?? new Date()).toISOString(),
    }),
  )

  return { version, requires, bundleKey: bKey, manifestKey: mKey, uploaded: stored === null }
}

/** 번들은 지우지 않는다. 매니페스트에서 끄기만 한다 */
export async function runRollback(input: {
  channel: string
  config: DeployConfig
  to?: string
}): Promise<Manifest> {
  const { channel, config } = input
  const key = manifestKey(config.prefix, config.name, channel)
  const next = rollback(await readManifest(config.storage, key, config.name), input.to)
  await writeManifest(config.storage, key, next)
  return next
}
