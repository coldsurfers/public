import { keyframes, style } from '@vanilla-extract/css'
import { MASONRY_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'

/** 새 칸이 떠오르는 시간 · 칸마다 늦추는 몫 · 늦춤 상한(ms). 웹 전용이라 계약에 없다. */
export const ENTER = { durationMs: 220, staggerMs: 30, maxDelayMs: 240 } as const

export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'flex-start',
    gap: spec.columnGap,
  }),
)

export const column = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minWidth: 0,
    gap: spec.rowGap,
  }),
)

const rise = keyframes({ from: { opacity: 0, transform: 'translateY(8px)' } })

/** 첫 렌더 뒤에 붙은 칸 — 아래에서 살짝 떠오른다. 늦춤은 `animationDelay` 로 받는다. */
export const enter = style(
  inComponentsLayer({
    '@media': {
      '(prefers-reduced-motion: no-preference)': {
        animation: `${rise} ${ENTER.durationMs}ms ease-out both`,
      },
    },
  }),
)
