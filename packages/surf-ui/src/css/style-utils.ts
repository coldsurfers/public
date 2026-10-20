import type { StyleRule } from '@vanilla-extract/css'
import { PRESS_SPEC, type PressSize } from '../contract/press'

/**
 * `.css.ts` 안에서 반복되는 조각들. **클래스가 아니라 스타일 규칙 조각**이라 평범한 `.ts` 다 —
 * VE 가 처리할 일이 없다.
 *
 * breakpoint 는 여기 없다 — 같은 디렉터리의 `./media` 를 쓴다.
 */

/** Tailwind `line-clamp-N` 등가. N 줄에서 자르고 말줄임. */
export const lineClamp = (lines: number): StyleRule => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
  overflow: 'hidden',
})

/**
 * 토큰 색에 알파를 먹인다. CSS 변수는 `rgba()` 에 쪼개 넣을 수 없으므로 `color-mix` 를 쓴다.
 * (Tailwind 의 `text-white/90` 같은 표기의 등가물.)
 */
export const alpha = (color: string, percent: number): string =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`

/**
 * 누르는 동안 살짝 줄어든다 — 값은 `PRESS_SPEC`. 동작 줄이기 설정이면 안 줄어든다.
 * `@media` 하나만 돌려주므로 펼쳐 합친다 — 받는 규칙에 이미 `@media` 가 있으면 덮어쓰니 배열(`style([a, b])`)로 합친다.
 * 돌아오는 애니메이션은 쓰는 쪽 `transitionProperty` 에 `scale` 을 더해야 붙는다.
 * @param size 넓은 면은 `large`, 아이콘 · 칩 · 글자는 `small`
 * @example style(inComponentsLayer({ transitionProperty: 'opacity, scale', ...pressable('small') }))
 */
export const pressable = (size: PressSize): StyleRule => ({
  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      selectors: { '&:active:not(:disabled)': { scale: `${PRESS_SPEC.scale[size]}` } },
    },
  },
})
