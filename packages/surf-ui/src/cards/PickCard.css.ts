import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 고르기 카드 — Figma `821:92`. 패널 안에 머리 · 줄 낱장 · 꼬리. */
export const root = style(inComponentsLayer({ gap: 6, padding: '16px 8px 8px' }))

export const head = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 10px 6px',
  }),
)

export const headText = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }),
)

export const foot = style(
  inComponentsLayer({
    padding: '6px 10px 4px',
    fontSize: 13,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textSecondary,
  }),
)

export const row = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 12px 12px 16px',
    borderRadius: vars.shape.radiusRow,
    background: vars.color.rowFill,
  }),
)

export const rowText = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }),
)

export const rowTitleLine = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
    fontSize: vars.shape.typeRowTitle,
    whiteSpace: 'nowrap',
  }),
)

export const rowTime = style(
  inComponentsLayer({
    flexShrink: 0,
    fontFamily: vars.font.geist,
    fontWeight: vars.fontWeight.semibold,
  }),
)

export const rowTitle = style(
  inComponentsLayer({
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 'inherit',
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '-0.02em',
  }),
)

export const rowMeta = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    fontSize: vars.shape.typeMeta,
    color: vars.color.textSecondary,
    whiteSpace: 'nowrap',
  }),
)
