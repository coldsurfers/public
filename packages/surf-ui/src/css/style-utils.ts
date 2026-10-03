import type { StyleRule } from '@vanilla-extract/css'

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
