/**
 * [1] Shared scope — 호스트가 자기 사본을 전역에 노출한다.
 *
 * 원격 번들이 `react` 를 자기 안에 번들해 들고 오면 훅이 깨진다(런타임에 React 가 둘).
 * 그래서 호스트가 **자기 사본**을 여기 걸어두고, 원격 번들은 import 대신 이걸 읽는다.
 * 치환은 빌드타임에 `./esbuild` 플러그인이 한다.
 *
 * 이 전역이 `require` 주입(호스트가 모듈 이름을 손으로 나열하던 화이트리스트)을 대체한다.
 */

export const SHARED_SCOPE_KEY = '__RN_MF_SHARED__' as const

type SharedScope = Record<string, unknown>

const globalRef = globalThis as typeof globalThis & {
  [SHARED_SCOPE_KEY]?: SharedScope
}

function scope(): SharedScope {
  const existing = globalRef[SHARED_SCOPE_KEY]
  if (existing) return existing
  const created: SharedScope = {}
  globalRef[SHARED_SCOPE_KEY] = created
  return created
}

/**
 * 호스트 부트에서 한 번 부른다. 넘긴 값이 그대로 singleton 이 된다.
 *
 * ```ts
 * registerShared({ react: require('react'), 'react-native': require('react-native') })
 * ```
 */
export function registerShared(modules: SharedScope): void {
  Object.assign(scope(), modules)
}

/** 원격 번들이 빌드타임 치환을 통해 부르는 자리. 없으면 던진다 — 조용히 undefined 를 넘기지 않는다. */
export function getShared<T = unknown>(name: string): T {
  const found = scope()[name]
  if (found === undefined) {
    throw new Error(
      `[react-native-mf] shared 모듈 "${name}" 이 등록돼 있지 않다. 호스트에서 registerShared() 로 먼저 노출한다.`,
    )
  }
  return found as T
}

export function hasShared(name: string): boolean {
  return scope()[name] !== undefined
}

/** 지금 호스트가 노출 중인 이름들. 진단·검증용. */
export function sharedNames(): string[] {
  return Object.keys(scope())
}
