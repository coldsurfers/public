import {
  cover,
  fontSize,
  fontWeight,
  layout,
  letterSpacing,
  lineHeight,
  radius,
  shape,
  spacing,
  type TokenScaleGroup,
  tokens,
} from '@coldsurfers/surf-ui/tokens'

export type TokenGroup =
  | 'color'
  | 'colorInk'
  | 'layout'
  | 'layoutDesktop'
  | 'shape'
  | 'cover'
  | 'spacing'
  | 'radius'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'

/**
 * 토큰 스케일 — **값을 문서에 옮겨 적지 않는다.** `@coldsurfers/surf-ui/tokens` 에서 읽는다.
 *
 * 화면의 스와치(`components/swatches.tsx`)와 평문 사본(`lib/llm-text.ts`)이 같은 이 표를 문다.
 * 둘로 쪼개면 토큰이 바뀔 때 한쪽만 조용히 거짓말을 시작한다.
 */
export const TOKEN_SCALES: Record<TokenGroup, Record<string, string>> = {
  color: tokens.color.light,
  colorInk: tokens.color.ink,
  layout: layout.mobile,
  layoutDesktop: layout.desktop,
  shape,
  cover,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
}

/** 문서 그룹 → CSS 변수 이름 그룹. 면 · 폭 두 벌은 같은 이름을 쓴다. */
export const VAR_GROUP: Record<TokenGroup, TokenScaleGroup> = {
  color: 'color',
  colorInk: 'color',
  layout: 'layout',
  layoutDesktop: 'layout',
  shape: 'shape',
  cover: 'cover',
  spacing: 'spacing',
  radius: 'radius',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
}

export const isColorGroup = (group: TokenGroup): boolean =>
  group === 'color' || group === 'colorInk' || group === 'cover'
