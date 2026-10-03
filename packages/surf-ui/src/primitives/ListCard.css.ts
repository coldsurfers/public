import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

export const listCard = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    paddingInline: vars.space['5'],
    paddingBlock: vars.space['1'],
    border: `1px solid ${vars.color.borderSoft}`,
    borderRadius: 20,
    background: vars.color.surface,
  }),
)

export const listCardFooter = style(
  inComponentsLayer({
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: vars.space['4'],
    borderTop: `1px solid ${vars.color.borderSoft}`,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.text,
  }),
)
