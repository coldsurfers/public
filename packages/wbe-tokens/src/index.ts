/**
 * `WHITE BLIND EYE` 레이블 지면의 토큰 **값** SSOT.
 *
 * 이 패키지가 갖는 건 셋이다 — 값 · 이름 규칙(`tokenVarName`) · 그 둘에서 파생한 `themeVars`.
 * CSS 를 만들지 않는다. VE·Tailwind·RN 중 무엇으로 구현할지는 소비처가 정한다.
 *
 * 출처는 Figma `Playground - Dev CM` Page 16 의 `WBE / STATE A~D` · `WBE / ARTIST — shevil`.
 */
export { type ColorToken, color } from './color'
export { cssVar, type TokenGroup, tokenVarName, varPrefix } from './css-var'
export { border, type SizeToken, type SpacingToken, size, spacing } from './layout'
export {
  type FontFamilyToken,
  type FontSizeToken,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
} from './typography'

import { color } from './color'
import { cssVar, type TokenGroup, tokenVarName } from './css-var'
import { border, size, spacing } from './layout'
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } from './typography'

const toVars = (
  group: TokenGroup,
  scale: Record<string, string | number>,
  format: (value: string | number) => string,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [`--${tokenVarName(group, key)}`, format(value)]),
  )

const raw = (value: string | number) => String(value)
const px = (value: string | number) => `${value}px`
const em = (value: string | number) => `${value}em`

/**
 * 전체 토큰을 CSS 변수 레코드로 — `{ '--wbe-bg': '#0a0a0a', '--wbe-font-size-display': '136px', … }`.
 * 루트에 한 번 주입하거나, 특정 서브트리만 WBE 로 고정할 때 컨테이너 `style` 로 넣는다.
 */
export const themeVars: Record<string, string> = {
  ...toVars('color', color, raw),
  ...toVars('fontFamily', fontFamily, raw),
  ...toVars('fontSize', fontSize, px),
  ...toVars('lineHeight', lineHeight, raw),
  ...toVars('letterSpacing', letterSpacing, em),
  ...toVars('fontWeight', fontWeight, raw),
  ...toVars('spacing', spacing, px),
  ...toVars('size', size, px),
  ...toVars('border', { hairline: px(border.hairline), dashArray: border.dashArray }, raw),
}

/** 자주 쓰는 참조 몇 개. 전부 `cssVar(group, key)` 로도 만들 수 있다. */
export const wbeVar = {
  bg: cssVar('color', 'bg'),
  fg: cssVar('color', 'fg'),
  muted: cssVar('color', 'muted'),
  line: cssVar('color', 'line'),
} as const
