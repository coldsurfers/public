/**
 * 배포 매니페스트 — 채널마다 한 장. 배포 CLI(Node)가 쓰고 호스트 resolver(RN)가 읽는다.
 *
 * 양쪽 레인이 같이 물어서 node 빌트인을 쓰지 않는다.
 *
 * ```
 * {prefix}/{name}/{version}/index.bundle.js   불변 — 버전마다 한 번만 올린다
 * {prefix}/{name}/{channel}/manifest.json     가변 — 배포 · 되돌리기가 고쳐 쓴다
 * ```
 */

export type Release = {
  version: string
  /** 번들이 실제로 읽는 shared specifier. 호스트가 이걸 다 `registerShared` 했을 때만 받는다 */
  requires: string[]
  /** `false` 면 호스트가 건너뛴다. 되돌리기는 지우지 않고 이걸 끈다 */
  enabled: boolean
  deployedAt: string
}

export type Manifest = {
  name: string
  /** 최신이 앞 */
  releases: Release[]
}

export const MANIFEST_FILE = 'manifest.json'
export const BUNDLE_FILE = 'index.bundle.js'

/** 영숫자로 시작해 `.` · `..` 이 못 들어온다. URL 로 읽힐 때 경로가 접혀 다른 채널을 가리키지 않게 */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

function segment(value: string, label: string): string {
  if (!SEGMENT.test(value)) {
    throw new Error(
      `[react-native-mf] ${label} 은 경로 한 칸이어야 한다(영숫자 · . _ -): "${value}"`,
    )
  }
  return value
}

function key(prefix: string, name: string, slot: string, slotLabel: string, file: string) {
  return [
    ...prefix
      .split('/')
      .filter(Boolean)
      .map((part) => segment(part, 'prefix')),
    segment(name, 'name'),
    segment(slot, slotLabel),
    file,
  ].join('/')
}

export function manifestKey(prefix: string, name: string, channel: string): string {
  return key(prefix, name, channel, 'channel', MANIFEST_FILE)
}

export function bundleKey(prefix: string, name: string, version: string): string {
  return key(prefix, name, version, 'version', BUNDLE_FILE)
}

export function emptyManifest(name: string): Manifest {
  return { name, releases: [] }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRelease(value: unknown): value is Release {
  if (typeof value !== 'object' || value === null) return false
  const release = value as Record<string, unknown>
  return (
    typeof release.version === 'string' &&
    isStringArray(release.requires) &&
    typeof release.enabled === 'boolean' &&
    typeof release.deployedAt === 'string'
  )
}

/** 저장소에서 읽은 글을 매니페스트로 편다. 모양이 틀리면 어디가 틀렸는지 대며 던진다. */
export function parseManifest(text: string, source: string): Manifest {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (cause) {
    throw new Error(`[react-native-mf] 매니페스트가 JSON 이 아니다: ${source}`, { cause })
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`[react-native-mf] 매니페스트는 객체여야 한다: ${source}`)
  }
  const { name, releases } = parsed as Record<string, unknown>
  if (typeof name !== 'string' || !Array.isArray(releases)) {
    throw new Error(`[react-native-mf] 매니페스트에 name · releases 가 없다: ${source}`)
  }
  const invalid = releases.find((release) => !isRelease(release))
  if (invalid !== undefined) {
    throw new Error(
      `[react-native-mf] 매니페스트의 릴리스 모양이 틀렸다(${source}): ${JSON.stringify(invalid)}`,
    )
  }

  return { name, releases }
}

/** 같은 버전이 이미 있으면 던진다 — 번들 경로는 버전마다 한 번만 쓴다. */
export function addRelease(manifest: Manifest, release: Release): Manifest {
  if (manifest.releases.some((existing) => existing.version === release.version)) {
    throw new Error(
      `[react-native-mf] ${manifest.name}@${release.version} 은 이미 이 채널에 있다. 버전을 올린다.`,
    )
  }
  return { ...manifest, releases: [release, ...manifest.releases] }
}

/**
 * `to` 가 없으면 켜진 최신 하나를 끈다. `to` 가 있으면 그보다 새 것을 전부 끄고 `to` 를 켠다 —
 * 같은 `to` 로 다시 돌려도 결과가 같다.
 *
 * 켜진 릴리스가 하나도 안 남는 되돌리기는 거절한다. 그러면 호스트가 받을 번들이 없다.
 */
export function rollback(manifest: Manifest, to?: string): Manifest {
  const target =
    to === undefined
      ? manifest.releases.filter((release) => release.enabled)[1]?.version
      : manifest.releases.find((release) => release.version === to)?.version

  if (target === undefined) {
    throw new Error(
      to === undefined
        ? `[react-native-mf] ${manifest.name} 에 되돌아갈 이전 릴리스가 없다.`
        : `[react-native-mf] ${manifest.name}@${to} 은 이 채널에 없다.`,
    )
  }

  const targetIndex = manifest.releases.findIndex((release) => release.version === target)
  return {
    ...manifest,
    releases: manifest.releases.map((release, index) =>
      index < targetIndex
        ? { ...release, enabled: false }
        : index === targetIndex
          ? { ...release, enabled: true }
          : release,
    ),
  }
}
