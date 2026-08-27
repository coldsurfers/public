/**
 * `Toast` 의 계약. 규율은 `./index.ts`.
 *
 * ⚠️ 값은 **이미 갈라져 있다** — padding(`11px 18px` ↔ `12/16`) · fontSize(`13.5` ↔ `14`) ·
 * dot height(`7` ↔ `6`) · `DISMISS_MS`(양쪽 `1600`, 두 번 적힘). 의도인지 사고인지 코드로
 * 구분되지 않는 상태다. `TOAST_SPEC` 을 올릴 때 어느 쪽이 정본인지부터 사람이 정해야 한다.
 */
export type ToastTone = 'neutral' | 'success' | 'error'
