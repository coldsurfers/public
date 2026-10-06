import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 이름 · 값 한 줄 — Figma `1028:387`. 연달아 놓으면 사이에 선이 생긴다. */
export const row = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 36,
    paddingInline: 12,
    fontFamily: vars.font.sans,
    lineHeight: 1.3,
    fontSize: vars.shape.typeBody,
    selectors: { '& + &': { borderTop: `1px solid ${vars.color.lineDivider}` } },
  }),
)

export const label = style(inComponentsLayer({ minWidth: 0, color: vars.color.textSecondary }))

export const value = style(
  inComponentsLayer({
    flexShrink: 0,
    color: vars.color.textPrimary,
    fontWeight: vars.fontWeight.bold,
    fontVariantNumeric: 'tabular-nums',
  }),
)
