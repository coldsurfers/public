import type { shape } from '../tokens'

/**
 * `BottomSheet` 의 계약. 규율은 `./index.ts`. 근거 시안 Figma `COLDSURF` 「📘 Sheet — 가이드」.
 *
 * 손잡이 색 · 그림자는 여기 없다 — 아직 토큰이 없다(가이드 「4. 토큰」 ✗ 항목).
 */

/**
 * `modal` — 메뉴 · 로그인 · 보드 고르기 · 알림 동의처럼 화면을 덮고 하나를 끝내는 시트.
 * `map` — 지도 위에 반쯤 걸쳐 지도와 같이 보는 시트. 모서리와 아래 여백이 작다.
 */
export type SheetKind = 'modal' | 'map'

type ShapeKey = keyof typeof shape

/**
 * 아래 여백은 홈 인디케이터(safe area) **위에** 더한다. 화면 아래에서 올라오는 시트의 값이다 —
 * 웹 데스크탑은 가운데 모달로 떠서 웹이 따로 정한다(`Sheet.css.ts`).
 */
export const SHEET_SPEC = {
  kind: {
    modal: { radius: 'radiusSheet', paddingBottom: 24 },
    map: { radius: 'radiusSheetMap', paddingBottom: 16 },
  } satisfies Record<SheetKind, { radius: ShapeKey; paddingBottom: number }>,
  /** 손잡이 막대. 끌어 내리면 닫힌다. */
  grab: { width: 36, height: 4 },
} as const
