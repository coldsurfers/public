import { type ButtonColor, type ButtonVariant, BUTTON_SPEC as spec } from '../contract'
import { vars } from '../css/contract.css'

/**
 * `Button` · `IconButton` 이 같이 쓰는 표면 계산 — native `button-style.ts` 의 웹 짝.
 * `.css.ts` 끼리는 함수를 주고받을 수 없어(VE 는 스타일만 export 한다) 평범한 모듈에 둔다.
 */

/** `ButtonColor` → CSS 값. native `colorFor` 와 짝이다. */
function colorFor(color: ButtonColor): string {
  return color === 'white' || color === 'transparent' ? color : vars.color[color]
}

/**
 * 바탕·글자·테두리. `:hover` 는 짝이 없어 호출부가 얹는다.
 *
 * 테두리를 **shorthand 로** 낸다 — base 의 `border: none` 을 longhand 로 덮으면 우선순위가
 * 소스 순서에 걸려 조용히 사라진다.
 */
export function surfaceStyle(variant: ButtonVariant) {
  const v = spec.variant[variant]
  return {
    background: colorFor(v.background),
    color: colorFor(v.label),
    ...('border' in v ? { border: `${v.border.width}px solid ${colorFor(v.border.color)}` } : null),
  }
}
