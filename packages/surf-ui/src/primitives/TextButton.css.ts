import { recipe } from '@vanilla-extract/recipes'
import { BUTTON_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 글자만 있는 작은 액션. 높이를 박지 않는다 — 문장 안에 섞여 줄 높이를 따라야 해서
 * `Button.css.ts` §높이 규율의 예외다(컨트롤이 아니라 글자다).
 */
export const textButton = recipe({
  base: inComponentsLayer({
    display: 'inline',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: vars.fontSize.sm,
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    selectors: {
      '&:disabled': { opacity: spec.disabledOpacity, cursor: 'not-allowed' },
    },
  }),

  variants: {
    tone: {
      /** 기본 — 흐린 글자, hover 때 본문색. */
      muted: inComponentsLayer({
        color: vars.color.textSecondary,
        selectors: { '&:hover:not(:disabled)': { color: vars.color.textPrimary } },
      }),
      /** 되돌릴 수 없는 액션을 한 번 더 확인할 때. */
      danger: inComponentsLayer({
        color: vars.color.statusDanger,
        fontWeight: vars.fontWeight.bold,
      }),
    },
  },

  defaultVariants: { tone: 'muted' },
})
