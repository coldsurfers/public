import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

export const posterCard = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['2'],
    minWidth: 0,
    color: vars.color.text,
    textDecoration: 'none',
  }),
)

export const posterCardDim = style(inComponentsLayer({ opacity: 0.45 }))

/** 포스터가 없으면 이 면이 남는다 — 비율은 그대로라 줄이 흔들리지 않는다. */
export const posterCardImage = style(
  inComponentsLayer({
    display: 'block',
    width: '100%',
    aspectRatio: '3 / 4',
    objectFit: 'cover',
    borderRadius: vars.radius.xl,
    background: vars.color.surface2,
  }),
)

export const posterCardTitle = style(
  inComponentsLayer({
    fontSize: vars.fontSize.base,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: vars.letterSpacing.normal,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

export const posterCardMeta = style(
  inComponentsLayer({ fontSize: vars.fontSize.sm, color: vars.color.muted }),
)
