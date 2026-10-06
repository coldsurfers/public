import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 정보 줄 — Figma `1028:461`. 썸네일 44 · 이름 · 부제 · `›`. */
export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 12,
    border: 0,
    borderRadius: vars.shape.radiusRow,
    background: vars.color.rowFill,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    lineHeight: 1.3,
    textAlign: 'left',
    textDecoration: 'none',
    selectors: { 'button&, a&': { cursor: 'pointer' } },
  }),
)

export const thumb = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 44,
    height: 44,
    overflow: 'hidden',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: vars.fontWeight.bold,
  }),
)

export const text = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }),
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

export const meta = style(
  inComponentsLayer({ fontSize: vars.shape.typeMeta, color: vars.color.textSecondary }),
)

export const chevron = style(
  inComponentsLayer({
    flexShrink: 0,
    fontSize: 18,
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textSecondary,
  }),
)
