import { bundleKey, type Manifest, manifestKey, parseManifest, type Release } from '../manifest'
import type { ScriptLocator, ScriptResolver } from './script-manager'
import { parseStorageKey, type ScriptStorage, storageKey } from './script-storage'
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

/** semver 프리릴리스 규칙 — 숫자 칸은 숫자로, 숫자 칸이 글자 칸보다 낮고, 앞이 같으면 짧은 쪽이 낮다 */
function comparePrerelease(a: string, b: string): number {
  const partsA = a.split('.')
  const partsB = b.split('.')
  for (let index = 0; index < Math.min(partsA.length, partsB.length); index += 1) {
    const [x, y] = [partsA[index], partsB[index]]
    if (x === y) continue
    const [numericX, numericY] = [/^\d+$/.test(x), /^\d+$/.test(y)]
    if (numericX && numericY) return Number(x) - Number(y)
    if (numericX !== numericY) return numericX ? -1 : 1
    return x < y ? -1 : 1
  }
  return partsA.length - partsB.length
}

function splitVersion(version: string): [core: string, prerelease: string | undefined] {
  const at = version.indexOf('-')
  return at < 0 ? [version, undefined] : [version.slice(0, at), version.slice(at + 1)]
}

function compareVersions(a: string, b: string): number {
  const [coreA, preA] = splitVersion(a)
  const [coreB, preB] = splitVersion(b)
  const partsA = coreA.split('.').map(Number)
  const partsB = coreB.split('.').map(Number)
  for (let index = 0; index < Math.max(partsA.length, partsB.length); index += 1) {
    const diff = (partsA[index] ?? 0) - (partsB[index] ?? 0)
    if (diff !== 0) return diff
  }
  if (preA === preB) return 0
  if (preA === undefined) return 1
  if (preB === undefined) return -1
  return comparePrerelease(preA, preB)
}

async function cachedVersions(storage: ScriptStorage, name: string): Promise<string[]> {
  return (await storage.list()).flatMap((key) => {
    const parsed = parseStorageKey(key)
    return parsed?.name === name ? [parsed.version] : []
  })
}

async function latestCached(storage: ScriptStorage, name: string): Promise<string | undefined> {
  const versions = (await cachedVersions(storage, name)).sort(compareVersions)
  return versions[versions.length - 1]
}

/** 매니페스트가 고른 버전만 남긴다. 되돌린 버전이 캐시에 남으면 다음 오프라인 부팅이 그걸 연다 */
async function pruneCache(storage: ScriptStorage, name: string, keep: string): Promise<void> {
  for (const version of await cachedVersions(storage, name)) {
    if (version !== keep) await storage.remove(storageKey(name, version))
  }
}

/**
 * 채널 매니페스트를 읽어 이 호스트와 맞는 최신 번들을 고른다.
 *
 * 매니페스트를 받았는데 맞는 릴리스가 없으면 던진다. 캐시로 넘어가지 않는다 — 되돌린 버전을 다시 열지 않게.
 * 매니페스트를 못 받으면(오프라인 · 시간 초과 · 모양 틀림) `storage` 에 캐시된 최신 버전으로 연다.
 * 그래서 매니페스트로 고른 뒤에는 이 이름의 다른 캐시 버전을 지운다.
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

    const { version } = pickRelease(manifest)
    // 지우기 실패로 로드를 깨지 않는다. 캐시는 정본이 아니다
    if (options.storage) await pruneCache(options.storage, name, version).catch(() => undefined)
    return locate(name, version)
  }
}
