import type { fontSize, fontWeight, radius } from '../tokens'

/**
 * `Chip` 의 계약. 규율은 `./index.ts`.
 *
 * **prop 인터페이스는 올리지 않는다.** 웹은 `ButtonHTMLAttributes`(또는 `as="span"` 쪽의
 * `HTMLAttributes`)를, RN 은 `TouchableOpacityProps` 를 extends 한다 — 공통 조상이 없어서
 * 억지로 묶으면 웹의 `asChild`·`as` 가 갈 곳을 잃는다. 그래서 여기 있는 건 축과 치수뿐이다.
 *
 * 색도 없다 — `vars.color.body` ↔ `scheme.body` 로 양쪽이 자기 토큰 맵에서 읽는다.
 * 다만 **어느 축에서 어느 색을 읽는가**는 갈리면 안 되므로 그 표는 두 구현의 주석이 아니라
 * 아래 `CHIP_SPEC` 옆 표에 적어 둔다.
 */
export type ChipSize = 'sm' | 'md'

type RadiusKey = keyof typeof radius
type FontSizeKey = keyof typeof fontSize
type FontWeightKey = keyof typeof fontWeight

type ChipSizeSpec = {
  height: number
  paddingInline: number
  borderWidth: number
  radius: RadiusKey
  fontSize: FontSizeKey
}

/**
 * 치수 — 웹 `Chip.css.ts` 가 리터럴로 들고 있던 값을 옮긴 것이다.
 *
 * **높이를 `height` 로 박는 이유**는 `Button.css.ts` 의 §높이(컨트롤 공통 규율)이고, RN 에서는
 * 더 강하다 — 세로 padding 으로 높이를 만들면 폰트 메트릭이 다른 iOS/Android 에서 같은 필이
 * 다른 높이로 선다. 35·26 은 상속 `line-height: 1.5` 에서 계산되던 값 그대로다
 * (md 14×1.5+6·2+1·2 · sm 12×1.5+4·2).
 *
 * 색은 축에서 읽는다 — 이 표가 두 구현의 정본이다:
 *
 * | 축 | 배경 | 테두리 | 글자 |
 * | --- | --- | --- | --- |
 * | `active` | `text` | 없음(transparent) | `bg` |
 * | `md` 비활성 | `surface` | `border` | `body` |
 * | `sm` 비활성 | `surface2` | 없음 | `muted` |
 *
 * 웹의 `:hover`(→`surfaceHover`)와 `transition` 은 RN 에 짝이 없다 — 누름 피드백은
 * `TouchableOpacity` 가 이미 준다. 짝이 없으면 계약이 아니므로 웹 `.css.ts` 에 남는다.
 */
export const CHIP_SPEC = {
  /** 라벨은 항상 한 줄 — 웹 `whiteSpace: nowrap` ↔ RN `numberOfLines`. */
  labelLines: 1,
  /** 두 크기 공통. */
  fontWeight: 'semibold' satisfies FontWeightKey,
  size: {
    /** rounded-full 필 — quick chips · section chips · filter. */
    md: {
      height: 35,
      paddingInline: 14,
      borderWidth: 1,
      radius: 'full',
      fontSize: 'sm',
    },
    /** 소형 tag — genre 태그. 테두리가 없고 바탕만으로 선다. */
    sm: {
      height: 26,
      paddingInline: 10,
      borderWidth: 0,
      radius: 'md',
      fontSize: 'xs',
    },
  } satisfies Record<ChipSize, ChipSizeSpec>,
} as const
