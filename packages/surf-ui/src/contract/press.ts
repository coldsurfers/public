/**
 * 누르는 동안 살짝 줄어드는 손맛 — 누를 수 있는 모든 것의 계약. 규율은 `./index.ts`.
 *
 * 투명도(`BUTTON_SPEC.pressedOpacity`)는 컴포넌트마다 다르게 남고, 여기는 **축소만** 묶는다.
 * 웹은 `css/style-utils` 의 `pressable`, native 는 `native/usePressScale` 이 이 표를 읽는다.
 * 동작 줄이기 설정이면 두 레인 다 줄이지 않는다.
 */

/**
 * `large` — 카드 · CTA 처럼 넓은 면. 0.94 면 가장자리가 크게 움직여 흔들려 보인다.
 * `small` — 아이콘 · 칩 · 작은 버튼 · 글자. 0.97 이면 1px 도 안 움직여 안 느껴진다.
 */
export type PressSize = 'large' | 'small'

export const PRESS_SPEC = {
  scale: { large: 0.97, small: 0.94 },
  /** 웹 — 떼고 돌아오는 시간. 컨트롤들의 기존 `transition` 150ms 와 같다. */
  releaseMs: 150,
  /** native — `Animated.spring` 의 `speed`. 클수록 빨리 줄고 빨리 돌아온다. bounciness 는 0. */
  springSpeed: 40,
} as const satisfies { scale: Record<PressSize, number>; releaseMs: number; springSpeed: number }
