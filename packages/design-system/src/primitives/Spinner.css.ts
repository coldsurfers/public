import { keyframes, style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** Figma Playground Dev-CM `LoadingSpinner · 무한스크롤`(341:2). */
export const spinnerRoot = style(
  inComponentsLayer({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  }),
)

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
})

export const spinnerSvg = style(
  inComponentsLayer({
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  }),
)

/** 배경 트랙 링. */
export const spinnerTrack = style(inComponentsLayer({ stroke: vars.color.border }))

/** 270° 아크 — blood-orange. */
export const spinnerArc = style(inComponentsLayer({ stroke: vars.color.accent }))

export const spinnerLabel = style(
  inComponentsLayer({
    fontWeight: vars.fontWeight.medium,
    fontSize: 13,
    color: vars.color.muted,
  }),
)

/** 화면에서만 감추고 스크린리더에는 남긴다 (Tailwind `sr-only` 등가). */
export const srOnly = style(
  inComponentsLayer({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
)
