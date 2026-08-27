/**
 * React Native 용 토큰 — **`./tokens` 에서 파생한다. 손으로 적은 값이 여기 없다.**
 *
 * 웹 토큰은 CSS 단위 문자열(`'0.625rem'`·`'2px'`)이고 RN 의 `StyleSheet` 는 숫자를 먹는다.
 * 그래서 두 벌이 필요한데, **값을 두 번 적으면 그 순간 SSOT 가 둘이 된다** — `tokens.ts`
 * 머리말이 경고하는 바로 그 결함이다. 그래서 이 파일은 스케일을 다시 쓰지 않고
 * `toPx` 로 기계 변환만 한다. 웹에서 눈금을 하나 추가하면 여기도 저절로 따라온다.
 *
 * 변환이 결정적인 근거: 타이포·간격 스케일이 "전부 16px root 기준 정수 px 등가" 로
 * 설계돼 있다(`tokens.ts` 의 `fontSize`·`spacing` 주석). 그래서 `rem × 16` 이 반올림 없이 떨어진다.
 *
 * **여기 없는 것과 그 이유:**
 *   - `editorialType` — `display` 가 `clamp()`, 나머지가 `em` 단위 `letterSpacing` 이다.
 *     RN 은 뷰포트 유동 타입도 상대 자간도 없다. 기계 변환이 아니라 재설계라 별도 결정으로 뺀다
 *   - `breakpoints` — RN 은 미디어쿼리가 아니라 `useWindowDimensions` 축이다. 같은 이유
 */

import { cover, fontSize, fontWeight, lineHeight, paper, radius, spacing, tokens } from './tokens'

export type { ColorScheme } from './tokens'

/** 웹 토큰의 rem 기준. `tokens.ts` 의 타이포 스케일이 이 값을 전제로 서 있다. */
const ROOT_FONT_SIZE = 16

/**
 * CSS 길이 문자열 → RN 숫자. `'0'` · `'0.625rem'` · `'2px'` 세 형태만 받는다 —
 * 토큰이 그 셋만 쓰기 때문이고, 넷째가 생기면 여기서 **터지는 게 맞다**.
 * 조용히 `NaN` 을 통과시키면 RN 쪽에서 레이아웃이 이유 없이 무너진다.
 */
export const toPx = (value: string): number => {
  if (value.endsWith('rem')) return Number.parseFloat(value) * ROOT_FONT_SIZE
  if (value.endsWith('px')) return Number.parseFloat(value)
  if (value === '0') return 0
  throw new Error(`[design-system/native] 변환할 수 없는 길이: ${value}`)
}

/** 스케일 키 — RN 컴포넌트가 props 축으로 그대로 쓴다. */
export type FontSizeKey = keyof typeof fontSize
export type LineHeightKey = keyof typeof lineHeight
export type FontWeightKey = keyof typeof fontWeight
export type SpacingKey = keyof typeof spacing
export type RadiusKey = keyof typeof radius

type Numeric<T> = { [K in keyof T]: number }

const toNumericScale = <T extends Record<string, string>>(scale: T): Numeric<T> =>
  Object.fromEntries(Object.entries(scale).map(([key, value]) => [key, toPx(value)])) as Numeric<T>

export const nativeFontSize = toNumericScale(fontSize)
export const nativeSpacing = toNumericScale(spacing)
export const nativeRadius = toNumericScale(radius)

/**
 * RN 의 `lineHeight` 는 배수가 아니라 **절대 포인트**다. 웹 토큰은 배수(`'1.6'`)라
 * 그대로 못 넘긴다 — 크기와 짝을 지어야 값이 나온다.
 *
 *   lineHeightFor('base', 'normal')  // 16 × 1.6 = 25.6
 *
 * 반올림하지 않는다. 어디서 자를지는 표면의 판단이고, 여기서 접으면 그 판단이 숨는다.
 */
export const lineHeightFor = (
  size: keyof typeof fontSize,
  ratio: keyof typeof lineHeight,
): number => nativeFontSize[size] * Number(lineHeight[ratio])

/**
 * 색은 hex 라 변환이 없다 — 이름만 다시 연다. RN 도 `'#f2efe8'` 를 그대로 먹는다.
 * `cover`·`paper` 는 스킴 불변 scale 이라 웹과 같은 객체를 그대로 쓴다.
 */
export const nativeColor = tokens.color.semantic
export { cover, paper }

/**
 * RN 에는 fallback 스택이 없다 — `fontFamily` 는 **등록된 폰트 하나**를 가리켜야 하고,
 * 없으면 조용히 시스템 폰트로 떨어진다. 그래서 웹의
 * `"'Pretendard Variable', Pretendard, -apple-system, …"` 를 단일 이름으로 접는다.
 *
 * ⚠️ 이건 *어느 서체를 쓰는가* 이지 *그 이름으로 해석된다* 는 보장이 아니다.
 * 실제 해석되는 이름은 플랫폼이 정하고(iOS 는 PostScript 명, Android 는 파일명),
 * **폰트 파일 등록은 소비 앱의 몫**이다. 등록 전에는 세 이름 모두 시스템 폰트가 된다.
 */
export const nativeFontFamily = {
  sans: 'Pretendard Variable',
  serif: 'Instrument Serif',
  mono: 'JetBrains Mono',
} as const

/** RN 은 `'300'`~`'900'` 문자열을 먹는다. 웹 토큰이 이미 그 형태라 그대로 통과. */
export { fontWeight }
