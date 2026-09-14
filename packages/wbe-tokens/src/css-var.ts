/**
 * 토큰 키 → CSS 변수 이름. **이름 규칙의 유일한 정본**이다.
 *
 * `@coldsurfers/design-system` 과 한 화면에 같이 실릴 수 있어 `wbe-` 로 네임스페이스를 가른다.
 * 규칙이 두 벌이 되면 어긋나도 타입은 통과하고 런타임에 `var(--없는이름)` 이 되어 값만 빈다.
 */

export const varPrefix = {
  color: '',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  fontWeight: 'font-weight',
  spacing: 'spacing',
  size: 'size',
  border: 'border',
} as const

export type TokenGroup = keyof typeof varPrefix

const NAMESPACE = 'wbe'

/** camelCase → kebab-case. 숫자는 분리한다: `tileSm` → `tile-sm`, `gap2xs` → `gap-2xs`. */
const kebab = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2')
    .toLowerCase()

/** 그룹 + 키 → CSS 변수 이름(`--` 제외). `('fontSize', 'display')` → `'wbe-font-size-display'`. */
export const tokenVarName = (group: TokenGroup, key: string): string =>
  [NAMESPACE, varPrefix[group], kebab(key)].filter(Boolean).join('-')

/** 그룹 + 키 → `var(--…)` 참조. */
export const cssVar = (group: TokenGroup, key: string): string =>
  `var(--${tokenVarName(group, key)})`
