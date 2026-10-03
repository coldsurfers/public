import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 칩 카드 — Figma `821:317`. 머리 한 줄 + 칩 r8 낱장. */
export const root = style(inComponentsLayer({ gap: 14, padding: '16px 18px 18px' }))

export const chips = style(inComponentsLayer({ display: 'flex', flexWrap: 'wrap', gap: 8 }))

export const item = style(
  inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    border: 0,
    borderRadius: vars.shape.radiusRowAction,
    background: vars.color.rowFill,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 150ms',
    selectors: { '&:hover': { background: vars.color.stateHover } },
  }),
)

export const label = style(
  inComponentsLayer({
    fontSize: 13,
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '-0.02em',
  }),
)

export const count = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: vars.shape.typeMeta,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textSecondary,
  }),
)
