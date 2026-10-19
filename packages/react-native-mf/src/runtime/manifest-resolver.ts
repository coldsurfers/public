import { bundleKey, type Manifest, manifestKey, parseManifest, type Release } from '../manifest'
import type { ScriptLocator, ScriptResolver } from './script-manager'
import { parseStorageKey, type ScriptStorage } from './script-storage'
import { hasShared } from './shared-scope'

export type ManifestResolverOptions = {
  /** 저장소를 내보내는 주소. `{baseUrl}/{prefix}/{name}/{channel}/manifest.json` 을 읽는다 */
  baseUrl: string
  /** `react-native-mf.config.ts` 의 `prefix` 와 같은 값 */
  prefix: string
  channel: string
  /** 이 resolver 가 맡는 이름. 나머지는 `undefined` 로 다음 resolver 에 넘긴다 */
  names: readonly string[]
  /** 매니페스트를 못 받을 때 여기 캐시된 최신 버전으로 연다. `scriptManager.setStorage` 와 같은 것을 준다 */
  storage?: ScriptStorage
  /** 기본 5000. 넘기면 못 받은 것으로 친다 */
  timeoutMs?: number
  /** 캐시로 넘어갈 때 원인을 받는다. 앱 쪽 로깅 자리다 */
  onError?: (error: unknown, name: string) => void
}

async function fetchManifest(url: string, name: string, timeoutMs: number): Promise<Manifest> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`[react-native-mf] 매니페스트를 받지 못했다 (${response.status} ${url}).`)
    }
    const manifest = parseManifest(await response.text(), url)
    if (manifest.name !== name) {
      throw new Error(`[react-native-mf] ${url} 는 "${manifest.name}" 의 매니페스트다.`)
    }
    return manifest
  } finally {
    clearTimeout(timer)
  }
}

/** 켜져 있고 `requires` 를 이 호스트가 다 내놓는 첫 릴리스. 최신이 앞이라 처음 맞는 것이 답이다 */
function pickRelease(manifest: Manifest): Release {
  const enabled = manifest.releases.filter((release) => release.enabled)
  const compatible = enabled.find((release) => release.requires.every(hasShared))
  if (compatible) return compatible

  const missing = [...new Set(enabled.flatMap((release) => release.requires))].filter(
    (specifier) => !hasShared(specifier),
  )
  throw new Error(
    enabled.length === 0
      ? `[react-native-mf] ${manifest.name} 에 켜진 릴리스가 없다.`
      : `[react-native-mf] ${manifest.name} 에 이 호스트와 맞는 릴리스가 없다. 호스트에 없는 shared: ${missing.join(', ')}`,
  )
}

function compareVersions(a: string, b: string): number {
  const [coreA, preA] = a.split('-', 2)
  const [coreB, preB] = b.split('-', 2)
  const partsA = coreA.split('.').map(Number)
  const partsB = coreB.split('.').map(Number)
  for (let index = 0; index < Math.max(partsA.length, partsB.length); index += 1) {
    const diff = (partsA[index] ?? 0) - (partsB[index] ?? 0)
    if (diff !== 0) return diff
  }
  if (preA === preB) return 0
  if (preA === undefined) return 1
  if (preB === undefined) return -1
  return preA < preB ? -1 : 1
}

async function latestCached(storage: ScriptStorage, name: string): Promise<string | undefined> {
  const versions = (await storage.list()).flatMap((key) => {
    const parsed = parseStorageKey(key)
    return parsed?.name === name ? [parsed.version] : []
  })
  return versions.sort(compareVersions)[versions.length - 1]
}

/**
 * 채널 매니페스트를 읽어 이 호스트와 맞는 최신 번들을 고른다.
 *
 * 매니페스트를 받았는데 맞는 릴리스가 없으면 던진다. 캐시로 넘어가지 않는다 — 되돌린 버전을 다시 열지 않게.
 * 매니페스트를 못 받으면(오프라인 · 시간 초과 · 모양 틀림) `storage` 에 캐시된 최신 버전으로 연다.
 */
export function createManifestResolver(options: ManifestResolverOptions): ScriptResolver {
  const base = options.baseUrl.replace(/\/+$/, '')
  const timeoutMs = options.timeoutMs ?? 5000
  const locate = (name: string, version: string): ScriptLocator => ({
    url: `${base}/${bundleKey(options.prefix, name, version)}`,
    version,
  })

  return async (name) => {
    if (!options.names.includes(name)) return undefined

    const url = `${base}/${manifestKey(options.prefix, name, options.channel)}`
    let manifest: Manifest
    try {
      manifest = await fetchManifest(url, name, timeoutMs)
    } catch (error) {
      const cached =
        options.storage && (await latestCached(options.storage, name).catch(() => undefined))
      if (!cached) throw error
      options.onError?.(error, name)
      return locate(name, cached)
    }

    return locate(name, pickRelease(manifest).version)
  }
}
