/**
 * 토큰 값 → `:root` 한 장(`dist/tokens.css`). `styles.css` 와 **같은 이름·같은 값**을 내지만
 * 컴포넌트 CSS 가 없다 — 변수만 필요한 소비자를 위한 두 번째 CSS 진입점이다.
 *
 * 왜 필요한가: `styles.css` 는 `cssCodeSplit: false` 라 리셋·primitives·cards 가 한 장에 다 실린다.
 * Tailwind 로 화면을 짜면서 색·간격만 우리 값으로 맞추려는 앱은 그 전량을 물 이유가 없다.
 *
 * **`@layer` 로 감싸지 않는다.** 소비 앱이 레이어 순서를 선언하지 않으면 `@layer` 블록은
 * 무레이어 규칙에 항상 진다 — 어느 레이어에 넣든 앱마다 우선순위가 달라진다. 변수 선언은
 * 캐스케이드 다툼의 대상이 아니라 값의 바닥이므로 무레이어 `:root` 가 맞다.
 * (`styles.css` 쪽은 반대다 — 거기선 리셋·컴포넌트와 같이 실리므로 레이어가 있어야 한다.)
 *
 * ⚠️ 두 진입점을 같이 물어도 안전하다. 같은 이름에 같은 값을 두 번 넣는 것뿐이다.
 */
import type { ColorScheme, TokenScaleGroup } from '../src/tokens'
import {
  cover,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  tokens,
  tokenVarName,
} from '../src/tokens'

const banner = '/* AUTO-GENERATED from src/tokens — do not edit. */\n'

/** 이름은 `cssVarPrefix` 표가 정한다 — 여기서 접두를 적지 않는다. */
const varBlock = (group: TokenScaleGroup, scale: Record<string, string>): string =>
  Object.entries(scale)
    .map(([key, value]) => `  --${tokenVarName(group, key)}: ${value};`)
    .join('\n')

const colorBlock = (scheme: ColorScheme): string =>
  (Object.entries(scheme) as Array<[keyof ColorScheme, string]>)
    .map(([key, value]) => `  --${tokenVarName('color', key)}: ${value};`)
    .join('\n')

/**
 * 블록 하나다. 스킴이 light 하나뿐이라(ink 폐기) 색과 스케일을 나눌 축이 없다 —
 * 나누면 소비자의 `@import` 만 늘어난다.
 */
export const buildTokensCss = (): string => `${banner}:root {
  color-scheme: light;

${varBlock('fontFamily', fontFamily)}

${varBlock('fontSize', fontSize)}

${varBlock('lineHeight', lineHeight)}

${varBlock('fontWeight', fontWeight)}

${varBlock('spacing', spacing)}

${varBlock('radius', radius)}

${varBlock('cover', cover)}

${varBlock('paper', paper)}

${colorBlock(tokens.color.semantic.light)}
}
`
