/**
 * [6] 원격 레지스트리 — 실행된 번들이 스스로 등록하고, 호스트가 여기서 회수한다.
 *
 * `new Function(...)` 이 `module.exports` 로 결과를 되돌려주던 자리를 대체한다.
 * 번들을 어떻게 실행했는지(소스 eval · 바이트코드)와 무관하게 회수 지점은 이 한 곳이다.
 * 등록 코드는 빌드타임에 `./esbuild` 의 footer 가 붙인다.
 */

export const REMOTE_REGISTRY_KEY = '__RN_MF_REMOTES__' as const

type RemoteRegistry = Record<string, unknown>

const globalRef = globalThis as typeof globalThis & {
  [REMOTE_REGISTRY_KEY]?: RemoteRegistry
}

function registry(): RemoteRegistry {
  const existing = globalRef[REMOTE_REGISTRY_KEY]
  if (existing) return existing
  const created: RemoteRegistry = {}
  globalRef[REMOTE_REGISTRY_KEY] = created
  return created
}

/** 원격 번들의 self-register footer 가 부른다. */
export function registerRemote(name: string, value: unknown): void {
  registry()[name] = value
}

/** 아직 실행 전이면 `undefined`. 던지지 않는다 — 로더가 실행 여부를 판단하는 자리다. */
export function getRemote<T = unknown>(name: string): T | undefined {
  return registry()[name] as T | undefined
}

export function hasRemote(name: string): boolean {
  return name in registry()
}

export function remoteNames(): string[] {
  return Object.keys(registry())
}
