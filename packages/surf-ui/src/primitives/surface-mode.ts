import { createContext, useContext } from 'react'
import type { SurfaceMode } from '../tokens/tokens'

/** `Page` 가 내려주는 면 모드. `Page` 밖은 `:root` 와 같은 `light`. */
export const SurfaceModeContext = createContext<SurfaceMode>('light')

/**
 * 지금 서 있는 `Page` 의 면 모드(`ink` · `light` · `auto`).
 *
 * `document.body` 로 portal 하는 오버레이가 이 값을 `data-surface` 로 다시 단다 — 포털은 DOM 상
 * `Page` 밖이라 그 면 스코프를 못 받기 때문이다. 부품이 `tone` prop 없이 면을 아는 자리도 이것이다.
 * `Page` 안의 `[data-surface]` 구간(히어로 한 칸 등)은 반영하지 않는다 — 면 단위가 아니라 페이지 단위다.
 *
 * ⚠️ `auto` 면 JS 는 지금 색을 모른다(SSR 에 OS 가 없다). 색 분기는 CSS 로 — `[data-surface="auto"]` 가 `@media` 로 고른다.
 */
export function useSurfaceMode(): SurfaceMode {
  return useContext(SurfaceModeContext)
}
