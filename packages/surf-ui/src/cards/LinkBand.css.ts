import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 링크 띠 — Figma `1028:431` · `1028:468`. 키커색 틴트 면 + 키커색 선 · 오른쪽 행동. */
export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '12px 14px',
    border: 0,
    borderRadius: vars.shape.radiusRow,
    background: vars.color.actionTintFill,
    boxShadow: `inset 0 0 0 1px ${vars.color.kicker}`,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    textAlign: 'left',
    textDecoration: 'none',
    selectors: { 'button&, a&': { cursor: 'pointer' } },
  }),
)

export const lead = style(
  inComponentsLayer({
    flexShrink: 0,
    fontFamily: vars.font.geist,
    fontSize: 22,
    fontWeight: vars.fontWeight.black,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: vars.color.kicker,
  }),
)

export const text = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }),
)

export const kicker = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: vars.shape.typeKicker,
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '0.18em',
    color: vars.color.kicker,
  }),
)

export const title = style(
  inComponentsLayer({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: vars.shape.typeBody,
    fontWeight: vars.fontWeight.bold,
  }),
)

export const action = style(
  inComponentsLayer({
    flexShrink: 0,
    fontSize: 13,
    fontWeight: vars.fontWeight.bold,
    color: vars.color.kicker,
  }),
)
