import type { fontSize, fontWeight, radius } from '../tokens'

/**
 * `Toast` 의 계약. 규율은 `./index.ts`.
 *
 * 치수는 `TOAST_SPEC`, 시간은 `TOAST_TIMING`. 한때 웹(`11px 18px` · 13.5 · 점 7)과 RN(12/16 ·
 * 14 · 점 6)이 갈려 있었고, RN 값을 정본으로 골랐다(2026-10-20, Figma `v3/Toast` 와 여백이 같다).
 *
 * ## 색은 여기 없다 — 어느 축을 읽는지만 적는다
 *
 * `tokens/` 가 정본이고 두 레인이 각자의 맵(`vars.color` ↔ `scheme`)에서 읽는다. 다만
 * **어느 축에서 어느 색을 읽는가**는 갈리면 안 되므로 그 표는 두 구현의 주석이 아니라 여기 둔다
 * (`CHIP_SPEC` 과 같은 규율).
 *
 * | 자리 | 축 |
 * | --- | --- |
 * | pill 바탕 | `text` |
 * | pill 글자 | `bg` |
 * | `error` 선행 점 | `accent` |
 * | 둘째 줄(`description`) | `ink.textSecondary` |
 * | 액션 | `ink.kicker` |
 *
 * 둘째 줄과 액션은 스킴 축이 아니라 **잉크 밴드 색**을 읽는다. pill 바탕이 스킴이 하나뿐인 지금
 * 언제나 Deep Night 이라, 그 위 보조 글자·링크는 `ink` 밴드와 같은 자리다(Figma `3743:1364`).
 * 액션이 `actionPrimary`(#2563ff)가 아닌 이유도 대비다 — #111111 위에서 3.9:1 로 13px 글자 하한
 * 4.5:1 을 못 넘는다. `ink.kicker`(#9ec2ff)는 10:1 이다. 한때 웹만 `actionPrimary` 였다.
 *
 * `error` 점이 상태색(`statusDanger`)이 **아닌** 이유는 대비다. pill 바탕이 `text`(ink #111111)라
 * `statusDanger`(#b8221c)는 그 위에서 2.95:1 이고, 비텍스트 그래픽 하한 3:1 을 못 넘는다 —
 * 점이 있는지 없는지가 안 보인다. `accent`(#d6451f)는 4.25:1 이다. 한때 RN 만 `statusDanger`
 * 였고 같은 `tone="error"` 가 두 플랫폼에서 다른 색으로 떴다.
 */
export type ToastTone = 'neutral' | 'success' | 'error'

/**
 * 토스트 한 건의 선택 조각.
 *
 * `action` 은 토스트 **안에서 끝나는 한 걸음**이다 — 「홈으로」처럼 누르면 어딘가로 가거나
 * 되돌린다. 누르면 토스트가 닫힌다. 라우팅은 DS 가 모르므로 `onPress` 로 받는다.
 */
export interface ToastOptions {
  /** 메시지 밑 둘째 줄. 있으면 pill 이 두 줄 상자로 바뀐다. */
  description?: string
  action?: { label: string; onPress: () => void }
}

/**
 * 시간 — 두 레인이 같이 읽는다.
 *
 * 액션이 있으면 더 오래 선다. 1.6초는 읽고 끝나는 알림 기준이라, 액션을 보고 손을 옮기기엔
 * 짧다.
 */
export const TOAST_TIMING = {
  dismissMs: 1600,
  actionDismissMs: 4000,
} as const

type FontSizeKey = keyof typeof fontSize
type FontWeightKey = keyof typeof fontWeight
type RadiusKey = keyof typeof radius
type TextSpec = { fontSize: FontSizeKey; fontWeight: FontWeightKey }

/** 한 줄 알약 ↔ 둘째 줄(`description`)이 있는 상자. */
export type ToastLayout = 'single' | 'stacked'

/**
 * 치수 — 두 레인이 같이 읽는다. 바닥에서 띄우는 거리는 여기 없다 — 탭바 · 홈 인디케이터처럼
 * 플랫폼이 가진 바닥이 달라서 각 레인이 정한다.
 *
 * `stacked` 모서리 16 — 두 줄 높이에선 알약이 타원이 된다.
 */
export const TOAST_SPEC = {
  paddingBlock: 12,
  paddingInline: 16,
  gap: { single: 8, stacked: 12 } satisfies Record<ToastLayout, number>,
  radius: { single: 'full', stacked: 16 } satisfies Record<ToastLayout, RadiusKey | number>,
  /** 메시지 ↔ 둘째 줄. */
  copyGap: 3,
  /** `error` 선행 점 지름. */
  dotSize: 6,
  message: { fontSize: 'sm', fontWeight: 'regular' } satisfies TextSpec,
  description: { fontSize: 'xs', fontWeight: 'regular' } satisfies TextSpec,
  action: { fontSize: 'xs', fontWeight: 'semibold' } satisfies TextSpec,
} as const
