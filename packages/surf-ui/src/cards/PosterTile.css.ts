import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 포스터 타일 — Figma `821:213`. 포스터 r24 + 아래 제목 줄. */
export const root = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minWidth: 0,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
  }),
)

export const poster = style(
  inComponentsLayer({
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: '421 / 300',
    borderRadius: vars.shape.radiusPoster,
  }),
)

export const posterImage = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)

export const bar = style(inComponentsLayer({ display: 'flex', alignItems: 'center', gap: 12 }))

export const text = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }),
)

export const title = style(inComponentsLayer({ fontSize: vars.layout.typeTileTitle }))

export const meta = style(
  inComponentsLayer({
    display: 'flex',
    gap: 6,
    fontSize: vars.shape.typeMeta,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textSecondary,
  }),
)
