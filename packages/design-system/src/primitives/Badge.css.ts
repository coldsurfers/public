import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 카드 위 작은 표식. `solid` = ink 필 mono 라벨, `soft` = 무테 subtle 메타. */
export const badge = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }),

  variants: {
    variant: {
      solid: inComponentsLayer({
        background: vars.color.text,
        color: vars.color.bg,
        fontFamily: vars.font.mono,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: vars.radius.md,
      }),
      soft: inComponentsLayer({
        color: vars.color.muted,
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
