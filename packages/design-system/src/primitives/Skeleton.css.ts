import { style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { pulse } from '../css/motion.css'
import { alpha } from '../css/style-utils'

/**
 * 로딩 자리표시자. **치수는 없다** — `Skeleton` 이 props 를 인라인 `style` 로 넣는다.
 * 여기 있는 건 소비처마다 갈리면 안 되는 셋뿐: 맥동 · 바탕 톤 · radius.
 *
 * 치수를 클래스로 안 받는 이유는 sprinkles 에 `width`/`height` 축이 없기 때문이고,
 * 그 축을 여는 건 이 컴포넌트 밖의 결정이다 (coldsurfers/public#25 결정 2).
 */

/** 맥동만 얹는 바닥. `./motion` 의 `pulse` 를 여기서 품는다 — 소비처가 직접 부를 일이 없다. */
export const skeletonRoot = style([pulse])

/**
 * 바탕 두 톤 — **클래스가 아니라 값**이다. `cards/ConcertCardSkeleton` 의 `barBase` 가
 * 같은 소스를 읽어야 두 구현이 갈리지 않는다.
 *
 * 실측 7갈래(`surfaceHover` · `faint 40/30` · `surface2 40` · `paper.warm 20/25/30` · `white` ·
 * `surface` · `surfaceGhost`)를 둘로 접은 값이다 — 축이 일곱이었던 게 아니라 기본값이 없었다.
 * `onCover` 는 어두운 커버 위 텍스트 자리(20/25/30 중간값)라 바닥 톤과 명도가 반대다.
 */
export const skeletonToneValue = {
  neutral: vars.color.surfaceHover,
  onCover: alpha(vars.paper.warm, 25),
} as const

export type SkeletonTone = keyof typeof skeletonToneValue

export const skeletonTone = styleVariants(skeletonToneValue, (background) =>
  inComponentsLayer({ background }),
)

export type SkeletonRadius = keyof typeof vars.radius

/** radius 는 sprinkles 에 이미 있는 축이라 토큰 키를 그대로 받는다. 기본은 `none`. */
export const skeletonRadius = styleVariants(vars.radius, (borderRadius) =>
  inComponentsLayer({ borderRadius }),
)
