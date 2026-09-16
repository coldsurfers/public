import type { ColorScheme, fontSize, fontWeight, radius } from '../tokens'

/**
 * `Button` · `IconButton` 의 계약. 규율은 `./index.ts`.
 *
 * 치수와 variant→색 매핑의 정본은 아래 `BUTTON_SPEC` 이다 — 웹 recipe(`Button.css.ts`)와
 * RN 구현(`native/button-style.ts`)이 같은 표를 각자의 토큰 맵으로 읽는다. 여기 숫자·색을
 * 고치지 않고 한쪽 구현만 고치면 두 레인이 갈린다.
 */

/**
 * 색 어휘. 웹 `Button.css.ts` recipe 의 variant 키와 1:1.
 *
 * `danger` 는 **되돌릴 수 없는 액션**의 자리다 — 탈퇴 · 영구 삭제. 색을 강조하려고 고르는
 * 것이 아니라 *되돌릴 수 없음*을 말하려고 고른다. 그래서 `accent`(주 액션)와 나란히 서지
 * 않는다. 한 화면에 둘이 같이 필요하면 둘 중 하나는 주 액션이 아니다.
 */
export type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'outline' | 'danger'

/** *라벨이 있는* 컨트롤의 높이 축. 정사각 `IconButton` 은 이 축을 쓰지 않는다. */
export type ButtonSize = 'sm' | 'md' | 'cta'

type RadiusKey = keyof typeof radius
type FontSizeKey = keyof typeof fontSize
type FontWeightKey = keyof typeof fontWeight

/**
 * 토큰 키거나, **스킴을 안 타는 리터럴**이다.
 *
 * `white` 는 토큰이 아니다 — `accent`·`danger` 필 위의 글자와 `outline` 의 바탕은 스킴이
 * 뒤집혀도 흰색이어야 한다(웹 recipe 가 `'white'` 리터럴을 쓰는 것과 같은 이유). 리터럴을
 * *허용*하는 게 아니라, 리터럴이라는 사실을 타입에 적어 두는 것이다.
 */
export type ButtonColor = keyof ColorScheme | 'white' | 'transparent'

/**
 * 치수 · 색이 토큰 스케일 안이면 **키**, 밖이면 **px 숫자**다.
 * 두 레인이 각자의 토큰 맵(`vars.*` ↔ `native*`)으로 키를 해석하고, 숫자는 그대로 쓴다.
 */
type ButtonSizeSpec = {
  height: number
  paddingInline: number
  fontSize: FontSizeKey | number
  radius: RadiusKey | number
}

type ButtonVariantSpec = {
  background: ButtonColor
  label: ButtonColor
  /** `outline` 만 갖는다. 나머지는 테두리가 없다 — 0 이 아니라 *없음*이다. */
  border?: { width: number; color: ButtonColor }
}

/**
 * **높이를 `height` 로 박고 padding 은 좌우만 준다** — 규율의 정본은 `Button.css.ts` 의
 * §높이다(`Chip`·`Select` 도 같은 규율이고 거기를 가리킨다). RN 에서는 더 강한 이유가
 * 하나 더 있다: 세로 padding 으로 높이를 만들면 폰트 메트릭이 다른 iOS/Android 에서
 * 같은 버튼이 다른 높이로 선다.
 *
 * `cta` 의 15px·10px 은 **스케일 밖 리터럴**이다 — 토큰이 12.5~17px 구간을 의도적으로 접었고
 * (`tokens.ts` 타이포 스케일 주석, 2026-08-04 실측), 그 결정을 시안 CTA 한 자리 때문에
 * 뒤집지 않는다. Figma `1128:119`·`1128:121` (148×46 · 86×46).
 */
const SIZE = {
  /** 인라인 액션. */
  sm: { height: 36, paddingInline: 16, fontSize: 'sm', radius: 'md' },
  /** 기본 — 폼 제출 · 주 액션. */
  md: { height: 52, paddingInline: 24, fontSize: 'base', radius: 'lg' },
  /** 랜딩 히어로 CTA. */
  cta: { height: 46, paddingInline: 22, fontSize: 15, radius: 10 },
} satisfies Record<ButtonSize, ButtonSizeSpec>

/**
 * variant → 표면 · 라벨색. **두 레인의 정본이다.**
 *
 * | 축 | 바탕 | 테두리 | 글자 |
 * | --- | --- | --- | --- |
 * | `primary` | `text` | 없음 | `bg` |
 * | `ghost` | 없음(transparent) | 없음 | `body` |
 * | `accent` | `accent` | 없음 | 흰색(리터럴) |
 * | `outline` | 흰색(리터럴) | `border` 1px | `text` |
 * | `danger` | `statusDanger` | 없음 | 흰색(리터럴) |
 *
 * 웹의 `:hover`(→`opacity`·`accentHover`·`strong`)와 `transition` 은 RN 에 짝이 없다 —
 * 누름 피드백은 `TouchableOpacity` 의 투명도가 이미 준다. 짝이 없으면 계약이 아니므로
 * 웹 `.css.ts` 에 남는다. `disabled` 투명도도 같다(지금은 RN 에만 있다).
 */
const VARIANT = {
  primary: { background: 'text', label: 'bg' },
  ghost: { background: 'transparent', label: 'body' },
  accent: { background: 'accent', label: 'white' },
  outline: { background: 'white', label: 'text', border: { width: 1, color: 'border' } },
  danger: { background: 'statusDanger', label: 'white' },
} satisfies Record<ButtonVariant, ButtonVariantSpec>

export const BUTTON_SPEC = {
  /** 라벨과 `trailingIcon` 사이. 아이콘이 없으면 붙을 상대가 없어 0 과 같다. */
  gap: 8,
  /** 세 크기 공통. */
  fontWeight: 'medium' satisfies FontWeightKey,
  size: SIZE,
  variant: VARIANT,
} as const
