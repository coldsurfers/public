import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 줄 행동 버튼 — Figma `821:65`. 키커색 14% 면 + 키커색 글자. */
export const rowAction = style(
  inComponentsLayer({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    height: vars.shape.sizeRowActionHeight,
    paddingInline: 12,
    borderRadius: vars.shape.radiusRowAction,
    border: 0,
    background: vars.color.actionTintFill,
    color: vars.color.actionTintText,
    fontFamily: vars.font.sans,
    fontSize: vars.shape.typeBody,
    fontWeight: vars.fontWeight.bold,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'filter 150ms',
    selectors: { '&:hover': { filter: 'brightness(0.96)' } },
  }),
)
