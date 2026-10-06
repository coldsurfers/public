import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 반응 줄 — Figma `1028:400`. 같은 폭 버튼 N개, 켠 것 하나만 `selected` 면. */
export const bar = style(
  inComponentsLayer({ display: 'flex', gap: 8, minWidth: 0, margin: 0, padding: 0, border: 0 }),
)

export const item = style(
  inComponentsLayer({
    display: 'inline-flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 0,
    height: 35,
    paddingInline: 10,
    border: 0,
    borderRadius: vars.shape.radiusPill,
    background: vars.color.rowFill,
    boxShadow: `inset 0 0 0 1px ${vars.color.lineDivider}`,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    lineHeight: 1,
    fontSize: 13,
    fontWeight: vars.fontWeight.bold,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
    selectors: {
      '&[aria-pressed="true"]': {
        background: vars.color.selectedFill,
        boxShadow: 'none',
        color: vars.color.selectedText,
      },
      '&:disabled': { cursor: 'default', opacity: 0.5 },
    },
  }),
)

export const count = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: 12,
    fontWeight: vars.fontWeight.medium,
    opacity: 0.7,
    fontVariantNumeric: 'tabular-nums',
  }),
)
