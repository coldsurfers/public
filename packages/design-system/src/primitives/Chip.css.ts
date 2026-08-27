import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * Pill — 시안의 4 맥락을 한 어휘로 덮는다.
 *
 * 기존 구현은 `active` 와 `size` 가 3항 연산자로 얽혀 있어(활성이면 size 무시, 비활성이면
 * size 별로 다른 색) 읽기 어려웠다. `compoundVariants` 가 그 얽힘을 **선언으로** 편다 —
 * "md 이면서 비활성일 때"가 한 줄로 보인다.
 *
 * ⚠️ **높이는 `height` 로 박는다** — 이유는 `Button.css.ts` 의 §높이(컨트롤 공통 규율).
 * 35·26 은 지금까지 상속 `line-height: 1.5` 에서 계산되던 값 그대로라 픽셀은 안 움직인다
 * (md 14×1.5+6·2+1·2 · sm 12×1.5+4·2). base 의 `whiteSpace: nowrap` 이 항상 한 줄을
 * 보장해서 높이를 박아도 라벨이 잘리지 않는다.
 */
export const chip = recipe({
  base: inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    fontWeight: vars.fontWeight.semibold,
    cursor: 'pointer',
    transitionProperty: 'color, background-color, border-color',
    transitionDuration: '150ms',
  }),

  variants: {
    size: {
      md: inComponentsLayer({
        borderRadius: vars.radius.full,
        borderWidth: 1,
        borderStyle: 'solid',
        height: 35,
        paddingInline: 14,
        fontSize: vars.fontSize.sm,
      }),
      sm: inComponentsLayer({
        borderRadius: vars.radius.md,
        border: 'none',
        height: 26,
        paddingInline: 10,
        fontSize: vars.fontSize.xs,
      }),
    },

    active: {
      true: inComponentsLayer({
        borderColor: 'transparent',
        background: vars.color.text,
        color: vars.color.bg,
      }),
      false: {},
    },
  },

  compoundVariants: [
    {
      variants: { size: 'md', active: false },
      style: inComponentsLayer({
        borderColor: vars.color.border,
        background: vars.color.surface,
        color: vars.color.body,
        selectors: { '&:hover': { background: vars.color.surfaceHover } },
      }),
    },
    {
      variants: { size: 'sm', active: false },
      style: inComponentsLayer({
        background: vars.color.surface2,
        color: vars.color.muted,
      }),
    },
  ],

  defaultVariants: { size: 'md', active: false },
})
