import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 포스터 선반 — Figma `1028:452`. 머리 키커 + 가로로 흐르는 칸(110). 넘치면 가로 스크롤 · 스냅. */
export const root = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }),
)

export const kicker = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: 10,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.18em',
    color: vars.color.kicker,
  }),
)

export const track = style(
  inComponentsLayer({
    display: 'flex',
    gap: 10,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollbarWidth: 'none',
    selectors: { '&::-webkit-scrollbar': { display: 'none' } },
  }),
)

export const item = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flexShrink: 0,
    width: 110,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    textDecoration: 'none',
    scrollSnapAlign: 'start',
  }),
)

export const itemTitle = style(
  inComponentsLayer({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
    fontWeight: vars.fontWeight.bold,
  }),
)

export const itemMeta = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: vars.shape.typeKicker,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textSecondary,
  }),
)
