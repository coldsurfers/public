import catalog from './common-dependencies.json' with { type: 'json' }

/**
 * shared 의존성 카탈로그.
 *
 * 값은 **호스트 앱이 실제로 물고 있는 버전**이다(현재 `billets-app` RN 0.87 기준).
 * 원격 번들이 자기 사본을 번들하면 안 되는 모듈 목록이자, 번들러 플러그인이 글로벌 참조로
 * 치환할 대상 목록이다.
 *
 * ⚠️ 호스트가 올라가면 여기도 올라가야 한다 — 어긋나면 원격 번들이 없는 API 를 부른다.
 * 자동 동기화는 Phase 1 의 몫이다.
 */

export type SharedDependency = {
  /** singleton 강제 여부. 훅·네이티브 상태를 들고 있는 모듈은 반드시 true */
  singleton: boolean
  /** 호스트가 제공하는 버전 */
  requiredVersion: string
  /** false 면 치환하지 않고 원격 번들에 그대로 번들한다 */
  shared: boolean
}

type CatalogEntry = { version: string; shared?: boolean }

const entries = catalog as Record<string, CatalogEntry>

export function getSharedDependencies(): Record<string, SharedDependency> {
  return Object.fromEntries(
    Object.entries(entries)
      .filter(([, entry]) => entry.shared !== false)
      .map(([name, entry]) => [
        name,
        { singleton: true, requiredVersion: entry.version, shared: true },
      ]),
  )
}

/** 번들러 플러그인이 치환 대상을 고를 때 쓰는 이름 목록. */
export function sharedDependencyNames(): string[] {
  return Object.keys(getSharedDependencies())
}
