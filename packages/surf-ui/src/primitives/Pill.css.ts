import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 지역 · 스팟을 바꾸는 선택기. 높이를 박는 규율은 `Button.css.ts` §높이. */
export const pill = style(
  inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.space['2'],
    height: 34,
    paddingInline: vars.space['3'],
    border: `1px solid ${vars.color.borderSoft}`,
    borderRadius: vars.radius.full,
    background: vars.color.surfaceGhost,
    color: vars.color.text,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    selectors: { '&:hover': { background: vars.color.surfaceGhostHover } },
  }),
)

export const pillIcon = style(inComponentsLayer({ display: 'inline-flex', flexShrink: 0 }))
