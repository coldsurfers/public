/**
 * `Toast` 의 계약. 규율은 `./index.ts`.
 *
 * ⚠️ 값은 **이미 갈라져 있다** — padding(`11px 18px` ↔ `12/16`) · fontSize(`13.5` ↔ `14`) ·
 * dot height(`7` ↔ `6`). 의도인지 사고인지 코드로 구분되지 않는 상태다. 치수 쪽 `TOAST_SPEC` 을
 * 올릴 때 어느 쪽이 정본인지부터 사람이 정해야 한다. 시간만 먼저 `TOAST_TIMING` 으로 올렸다.
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
 * | 둘째 줄(`description`) | `palette.haze` |
 * | 액션 | `ink.accent` |
 *
 * 둘째 줄과 액션은 스킴 축이 아니라 **잉크 밴드 색**을 읽는다. pill 바탕이 스킴이 하나뿐인 지금
 * 언제나 Deep Night 이라, 그 위 보조 글자·링크는 `ink` 밴드와 같은 자리다(Figma `3743:1364`).
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
