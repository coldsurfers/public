import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 미디어 줄 — Figma `1028:331`. 썸네일 52×70 · 글 넷 · 오른쪽 칸. */
export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '8px 12px 8px 8px',
    border: 0,
    borderRadius: vars.shape.radiusRow,
    background: vars.color.rowFill,
    boxShadow: 'inset 0 0 0 1px transparent',
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
    lineHeight: 1.3,
    textAlign: 'left',
    textDecoration: 'none',
    transition: 'background 150ms, box-shadow 150ms, opacity 150ms',
    selectors: {
      '&[data-selected]': {
        background: vars.color.actionTintFill,
        boxShadow: `inset 0 0 0 1px ${vars.color.kicker}`,
      },
      '&[data-dimmed]': { opacity: 0.45 },
      'button&, a&': { cursor: 'pointer' },
    },
  }),
)

export const thumb = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: vars.shape.sizeThumb,
    height: 70,
    borderRadius: 8,
    fontSize: 28,
    fontWeight: vars.fontWeight.black,
  }),
)

export const text = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }),
)

export const kicker = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: vars.shape.typeKicker,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.04em',
    color: vars.color.kicker,
  }),
)

const oneLine = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

export const title = style(
  inComponentsLayer({
    ...oneLine,
    margin: 0,
    fontSize: vars.shape.typeRowTitle,
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '-0.02em',
  }),
)

export const meta = style(
  inComponentsLayer({ ...oneLine, fontSize: vars.shape.typeMeta, color: vars.color.textSecondary }),
)

export const footer = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    marginTop: 2,
    fontFamily: vars.font.geist,
    fontSize: 13,
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '-0.02em',
  }),
)

export const aside = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  }),
)
