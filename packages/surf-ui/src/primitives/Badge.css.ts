import { style, styleVariants } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 카드 위 작은 표식. `solid` = ink 필 라벨, `soft` = 무테 subtle 메타. 둘 다 sans — 이유는 `Eyebrow.css.ts`.
 *
 * `solid` 높이는 `height` 로 박는다 — 이유는 `Button.css.ts` 의 §높이. 19 는 상속 `line-height: 1.5`
 * 에서 계산되던 값 그대로라 픽셀은 안 움직인다(10×1.5+2·2).
 */
export const badge = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }),

  variants: {
    variant: {
      solid: inComponentsLayer({
        background: vars.color.textPrimary,
        color: vars.color.bgBase,
        fontFamily: vars.font.sans,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: 10,
        height: 19,
        paddingInline: 8,
        borderRadius: vars.radius.md,
      }),
      soft: inComponentsLayer({
        color: vars.color.textSecondary,
        fontSize: vars.fontSize.xs,
      }),
    },
  },

  defaultVariants: { variant: 'solid' },
})

/** 선행 점 — 현재 글자색을 그대로 쓴다(variant 마다 색을 다시 정하지 않기 위해). */
export const badgeDot = style(
  inComponentsLayer({
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: vars.radius.full,
    background: 'currentColor',
  }),
)

/**
 * 라벨 — `solid` 는 늘 대문자라 글자 상자를 대문자 높이로 잘라야 눈으로 가운데에 선다.
 * 그냥 두면 폰트 위 여백이 더 커서 1px 남짓 뜬다. flex 상자 자신에는 `text-box` 가 안 먹어 블록 한 겹에 건다.
 * `soft` 는 상자가 없는 메타 글이라 자르지 않는다.
 */
export const badgeLabel = styleVariants({
  solid: [inComponentsLayer({ display: 'block', textBox: 'trim-both cap alphabetic' })],
  soft: [],
})
