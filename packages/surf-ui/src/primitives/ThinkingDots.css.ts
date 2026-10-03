import { keyframes, style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

const blink = keyframes({
  '0%, 70%, 100%': { opacity: 0.25 },
  '35%': { opacity: 1 },
})

export const root = style(
  inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  }),
)

/**
 * 점 하나. 셋이 순서대로 밝아진다 — 지연은 형제 순서로만 준다(부모가 개수를 안 세도 된다).
 * reduced-motion 이면 깜빡임을 멈추고 옅은 점 셋으로 남는다.
 */
export const dot = style(
  inComponentsLayer({
    width: 6,
    height: 6,
    borderRadius: vars.radius.full,
    background: vars.color.muted,
    animationName: blink,
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
    selectors: {
      '&:nth-child(2)': { animationDelay: '160ms' },
      '&:nth-child(3)': { animationDelay: '320ms' },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': { animationName: 'none', opacity: 0.4 },
    },
  }),
)
