/**
 * `WHITE BLIND EYE` 테마 레인 — 토큰 **값**(`@coldsurfers/wbe-tokens`) 위에 얹는 실제 스타일.
 *
 * 소비처가 지는 배선은 둘뿐이다:
 *   import '@coldsurfers/wbe-theme/fonts'   // 웹폰트 (선택)
 *   import { text, hairline, vars } from '@coldsurfers/wbe-theme'
 *
 * CSS 는 진입점이 물고 온다 — `styles.css` 를 따로 import 하지 않아도 된다.
 * sprinkles 만 무게 때문에 `@coldsurfers/wbe-theme/sprinkles` 로 갈라져 있다.
 */
import './reset.css'

/** 값이 필요한 소비처가 토큰 패키지를 따로 물지 않게 그대로 통과시킨다. */
export {
  border,
  color,
  cssVar,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  size,
  spacing,
  themeVars,
  tokenVarName,
} from '@coldsurfers/wbe-tokens'
export { componentsLayer, LAYER_ORDER, resetLayer, themeLayer } from './layers'
export { dashedSlot, type HairlineVariants, hairline } from './surface.css'
export { type TextVariants, text } from './text.css'
export { vars } from './theme.css'
