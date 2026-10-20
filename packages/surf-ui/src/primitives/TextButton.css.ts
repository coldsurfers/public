import { recipe } from '@vanilla-extract/recipes'
import { BUTTON_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { pressable } from '../css/style-utils'

/**
 * 글자만 있는 작은 액션. 높이를 박지 않는다 — 문장 안에 섞여 줄 높이를 따라야 해서
 * `Button.css.ts` §높이 규율의 예외다(컨트롤이 아니라 글자다).
 * `inline-block` 인 이유: 인라인 박스엔 누름 축소(`scale`)가 안 먹는다. 대가로 긴 라벨이 줄을 넘겨 접히지 않는다.
 */
export const textButton = recipe({
  base: inComponentsLayer({
    display: 'inline-block',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: vars.fontSize.sm,
    cursor: 'pointer',
    transitionProperty: 'color, scale',
    transitionDuration: '150ms',
    selectors: {
      '&:disabled': { opacity: spec.disabledOpacity, cursor: 'not-allowed' },
      '&:active:not(:disabled)': { opacity: spec.pressedOpacity },
    },
    ...pressable('small'),
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
