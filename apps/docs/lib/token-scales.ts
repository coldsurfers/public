import {
  cover,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  tokens,
} from '@coldsurfers/design-system/tokens'

export type TokenGroup =
  | 'color'
  | 'cover'
  | 'paper'
  | 'spacing'
  | 'radius'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'

/**
 * 토큰 스케일 — **값을 문서에 옮겨 적지 않는다.** `@coldsurfers/design-system/tokens` 에서 읽는다.
 *
 * 화면의 스와치(`components/swatches.tsx`)와 평문 사본(`lib/llm-text.ts`)이 같은 이 표를 문다.
 * 둘로 쪼개면 토큰이 바뀔 때 한쪽만 조용히 거짓말을 시작한다.
 */
export const TOKEN_SCALES: Record<TokenGroup, Record<string, string>> = {
  color: tokens.color.semantic.light,
  cover,
  paper,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
}
