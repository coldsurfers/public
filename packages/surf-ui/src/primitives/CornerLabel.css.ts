import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { alpha } from '../css/style-utils'

/** 귀퉁이 라벨 — Figma `831:2` 묶음 왼쪽 위. 대문자 두 줄까지 + 짧은 선. */
export const root = style(
  inComponentsLayer({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    margin: 0,
    fontFamily: vars.font.geist,
    fontSize: 10,
    fontWeight: vars.fontWeight.medium,
    lineHeight: '16px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    whiteSpace: 'pre-line',
    color: alpha(vars.color.textPrimary, 78),
    '::after': {
      content: '""',
      width: 20,
      height: 1,
      background: alpha(vars.color.textPrimary, 45),
    },
    '@media': {
      [media.desktop]: {
        gap: 12,
        fontSize: vars.shape.typeKicker,
        lineHeight: '18px',
        selectors: { '&::after': { width: 24 } },
      },
    },
  }),
)
