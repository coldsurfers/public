import { style } from '@vanilla-extract/css'
import { MASONRY_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'

export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'flex-start',
    gap: spec.columnGap,
  }),
)

export const column = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minWidth: 0,
    gap: spec.rowGap,
  }),
)
