import { createGlobalThemeContract } from '@vanilla-extract/css'
import {
  cover,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  paper,
  radius,
  spacing,
  type TokenScaleGroup,
  tokens,
  tokenVarName,
} from '../tokens'
// 부수효과 import — 모든 `.css.ts` 가 contract 를 쓰므로, 이 한 줄이 "VE CSS 의 맨 앞은
// 언제나 레이어 순서 선언"을 보장한다. 이유는 `layers.css.ts` 주석 참조.
import './layers.css'

/**
 * 디자인 시스템 계약 — CSS 변수 **이름**을 타입으로 승격한다.
 *
 * 여기서 값을 재정의하지 않으므로 이 파일의 산출 CSS 에는 `:root` 블록이 없다 —
 * `var(--…)` 참조로만 남는다. 그 이름에 값을 넣는 건 `theme.css.ts` 다.
 *
 * 효과: 토큰 밖의 색을 쓰면 **타입 에러**다. 규율의 강제 주체가 문서·감사 스크립트에서 `tsc` 로 옮겨간다.
 *
 * **이름을 손으로 적지 않는다.** 아래 `shape` 은 토큰 스케일 객체를 그대로 참조하고(값은 버려지고
 * 키만 쓰인다), 변수 이름은 `tokenVarName` 이 계산한다. 그 규칙의 정본은 `../tokens` 의
 * `cssVarPrefix` 표 하나뿐이다. 예전엔 이 파일이 이름 70줄을 손으로 들고 있어서 토큰을 추가할
 * 때마다 양쪽을 같이 고쳐야 했고, 한쪽만 고치면 타입은 통과한 채 런타임에 `var(--없는이름)` 이 됐다.
 */
const shape = {
  /** 스킴별로 값이 갈리지만 **키는 같다**(`ColorScheme`). 계약엔 키만 필요해 어느 쪽을 넘겨도 된다. */
  color: tokens.color.semantic.dark,
  font: fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  space: spacing,
  radius,
  /** 이벤트 표지 6톤. 데이터로 정해지는 색이라 런타임 주입 대상 — `assignInlineVars` 와 짝. */
  cover,
  /** `paper.warm` 은 `color.bg` 와 **다른 표면**이다. 통일 대상이 아니라 구별 대상. */
  paper,
}

/**
 * 계약 그룹 이름 → 토큰 스케일 그룹. 접두를 정하는 건 오른쪽이다.
 * `space`·`font` 는 계약 쪽 이름이 tokens 쪽(`spacing`·`fontFamily`)과 다른 두 자리다.
 */
const TOKEN_GROUP: Record<keyof typeof shape, TokenScaleGroup> = {
  color: 'color',
  font: 'fontFamily',
  fontSize: 'fontSize',
  lineHeight: 'lineHeight',
  fontWeight: 'fontWeight',
  space: 'spacing',
  radius: 'radius',
  cover: 'cover',
  paper: 'paper',
}

export const vars = createGlobalThemeContract(shape, (_value, path) => {
  const [group, key] = path as [keyof typeof shape, string]
  return tokenVarName(TOKEN_GROUP[group], key)
})
