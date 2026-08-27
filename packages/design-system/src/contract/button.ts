/**
 * `Button` · `IconButton` 의 계약. 규율은 `./index.ts`.
 *
 * 아직 타입뿐이다 — 치수(height 36·52·46 / paddingX 16·24·22 / fontSize·radius)와
 * variant→표면·라벨색 매핑 20여 개가 웹 `Button.css.ts` 와 native `Button.tsx` 에 손으로
 * 두 번 적혀 있고, 담보가 주석 한 줄이다. `BUTTON_SPEC` 이 들어올 자리가 여기다.
 */

/** 색 어휘. 웹 `Button.css.ts` recipe 의 variant 키와 1:1. */
export type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'outline'

/** *라벨이 있는* 컨트롤의 높이 축. 정사각 `IconButton` 은 이 축을 쓰지 않는다. */
export type ButtonSize = 'sm' | 'md' | 'cta'
