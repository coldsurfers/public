/**
 * `Toast` 의 계약. 규율은 `./index.ts`.
 *
 * ⚠️ 값은 **이미 갈라져 있다** — padding(`11px 18px` ↔ `12/16`) · fontSize(`13.5` ↔ `14`) ·
 * dot height(`7` ↔ `6`) · `DISMISS_MS`(양쪽 `1600`, 두 번 적힘). 의도인지 사고인지 코드로
 * 구분되지 않는 상태다. `TOAST_SPEC` 을 올릴 때 어느 쪽이 정본인지부터 사람이 정해야 한다.
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
 *
 * `error` 점이 상태색(`statusDanger`)이 **아닌** 이유는 대비다. pill 바탕이 `text`(ink #111111)라
 * `statusDanger`(#b8221c)는 그 위에서 2.95:1 이고, 비텍스트 그래픽 하한 3:1 을 못 넘는다 —
 * 점이 있는지 없는지가 안 보인다. `accent`(#d6451f)는 4.25:1 이다. 한때 RN 만 `statusDanger`
 * 였고 같은 `tone="error"` 가 두 플랫폼에서 다른 색으로 떴다.
 */
export type ToastTone = 'neutral' | 'success' | 'error'
