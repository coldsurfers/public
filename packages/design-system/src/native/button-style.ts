import type { ViewStyle } from 'react-native'
import { type ButtonColor, type ButtonVariant, BUTTON_SPEC as spec } from '../contract'
import type { ColorScheme } from '../tokens/native'

/**
 * `Button` · `IconButton` 이 같이 쓰는 표면 계산. **진입점이 아니다** —
 * `vite.config.ts` 의 `lib.entry` 에 없으므로 `exports` 맵에도 없고, 여기 있는 이름은
 * 공개 API 가 아니다.
 *
 * 두 컴포넌트 중 한쪽에 두고 다른 쪽이 import 하면 안 된다: `./native/Button` 과
 * `./native/IconButton` 은 **서로 독립인 진입점**이고, Metro 는 tree-shaking 을 하지 않아
 * (`vite.config.ts` 「native 서브패스」) 아이콘 버튼 하나 물려던 소비처가 `Button` 을
 * 통째로 같이 문다. 공유는 양쪽이 *제3의 모듈*을 물 때만 공짜다.
 */

/**
 * 비활성 표시. 웹엔 짝이 없어 `BUTTON_SPEC` 에 올리지 않는다 — 웹 recipe 에는 `:disabled`
 * 스타일이 아예 없다(`contract/button.ts` 의 "짝이 없으면 계약이 아니다").
 *
 * 컴포넌트의 **기본 스타일**로 넣는다. `style` prop 으로 얹으면 소비자가 `style` 을 넘기는
 * 순간 조용히 덮여서 **비활성이 활성처럼 보인다.** 기본 스타일이면 소비자 `style` 이 이기는
 * 것도 덮는 것도 명시적 선택이 된다.
 */
export const DISABLED_OPACITY = 0.4

/**
 * `ButtonColor` → 실제 색. 토큰 키는 스킴에서 읽고, 스킴을 안 타는 리터럴은 그대로 낸다.
 * 웹 `Button.css.ts` 의 `colorFor` 와 짝이다 — 같은 표를 각자의 토큰 맵으로 읽는다.
 */
export function colorFor(scheme: ColorScheme, color: ButtonColor): string {
  return color === 'white' || color === 'transparent' ? color : scheme[color]
}

/** `BUTTON_SPEC.variant` 표를 RN 스타일로. */
export function surfaceFor(scheme: ColorScheme, variant: ButtonVariant): ViewStyle {
  const v = spec.variant[variant]
  return {
    backgroundColor: colorFor(scheme, v.background),
    ...('border' in v
      ? { borderWidth: v.border.width, borderColor: colorFor(scheme, v.border.color) }
      : null),
  }
}
