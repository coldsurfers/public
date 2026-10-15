import { recipe } from '@vanilla-extract/recipes'
import { ICON_BUTTON_SPEC as icon, BUTTON_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { surfaceStyle } from './button-surface'

/**
 * 아이콘만 있는 정사각 액션의 스타일 계약. 치수는 `ICON_BUTTON_SPEC`, 색은 `BUTTON_SPEC.variant`.
 * `:hover` 만 리터럴이다 — RN 에 짝이 없다(`Button.css.ts` 와 같은 이유).
 */
export const iconButton = recipe({
  base: inComponentsLayer({
    display: 'inline-grid',
    placeItems: 'center',
    flexShrink: 0,
    padding: 0,
    border: 'none',
    borderRadius: vars.radius[icon.radius],
    cursor: 'pointer',
    transitionProperty: 'color, background-color, border-color, opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    selectors: {
      '&:disabled': { opacity: spec.disabledOpacity, cursor: 'not-allowed' },
    },
  }),

  variants: {
    variant: {
      /** 바탕이 없어 hover 를 면으로 보인다 — 글자색만 바꾸면 아이콘에선 안 보인다. */
      ghost: inComponentsLayer({
        ...surfaceStyle('ghost'),
        selectors: { '&:hover:not(:disabled)': { background: vars.color.stateHover } },
      }),
      primary: inComponentsLayer({
        ...surfaceStyle('primary'),
        selectors: { '&:hover:not(:disabled)': { opacity: 0.9 } },
      }),
      accent: inComponentsLayer({
        ...surfaceStyle('accent'),
        selectors: { '&:hover:not(:disabled)': { filter: 'brightness(1.08)' } },
      }),
      outline: inComponentsLayer({
        ...surfaceStyle('outline'),
        selectors: { '&:hover:not(:disabled)': { borderColor: vars.color.textPrimary } },
      }),
      danger: inComponentsLayer({
        ...surfaceStyle('danger'),
        selectors: { '&:hover:not(:disabled)': { opacity: 0.9 } },
      }),
    },

    size: {
      sm: inComponentsLayer({ width: icon.side.sm, height: icon.side.sm }),
      md: inComponentsLayer({ width: icon.side.md, height: icon.side.md }),
    },

    /** `pill` 이면 정사각이라 원이 된다. 모서리를 덮으므로 base 뒤에 둔다. */
    shape: {
      rounded: {},
      pill: inComponentsLayer({ borderRadius: vars.radius[spec.pillRadius] }),
    },
  },

  defaultVariants: { variant: 'ghost', size: 'md', shape: 'rounded' },
})
