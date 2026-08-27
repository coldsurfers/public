import { keyframes, style } from '@vanilla-extract/css'
import { inComponentsLayer } from './component-layer'

const pulseFrames = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
})

/** Tailwind `animate-pulse` 등가 — 스켈레톤 전용. */
export const pulse = style(
  inComponentsLayer({
    animationName: pulseFrames,
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  }),
)
