import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

export const posterStage = style(
  inComponentsLayer({
    position: 'relative',
    isolation: 'isolate',
    width: '100%',
  }),
)

/** 포스터 뒤 번짐 — 색은 `tintGlow`(앱이 포스터에서 뽑아 덮는다). */
export const posterStageGlow = style(
  inComponentsLayer({
    position: 'absolute',
    inset: '12% 0 -4%',
    zIndex: -1,
    borderRadius: vars.radius.full,
    background: vars.color.tintGlow,
    filter: 'blur(140px)',
    pointerEvents: 'none',
  }),
)

export const posterStageImage = style(
  inComponentsLayer({
    display: 'block',
    width: '100%',
    aspectRatio: '3 / 4',
    objectFit: 'cover',
    borderRadius: 28,
    background: vars.color.surface2,
  }),
)
