import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 패널 공통 — 고르기 카드 · 칩 카드 · 기능 카드가 같은 면에 선다. */
export const panel = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    borderRadius: vars.shape.radiusPanel,
    background: vars.color.panelFill,
    boxShadow: `inset 0 0 0 1px ${vars.color.panelLine}`,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
  }),
)

/** 카드 머리 한 줄 — 굵게 16 · −3%. */
export const cardHead = style(
  inComponentsLayer({
    margin: 0,
    fontSize: vars.shape.typeCardHead,
    fontWeight: vars.fontWeight.bold,
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
  }),
)

/** 키커 — Geist 11 · 자간 12%. */
export const kicker = style(
  inComponentsLayer({
    fontFamily: vars.font.geist,
    fontSize: vars.shape.typeKicker,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.12em',
    color: vars.color.kicker,
  }),
)

/** 큰 제목 — Black · −4%. 크기는 부품이 정한다. */
export const blackTitle = style(
  inComponentsLayer({
    margin: 0,
    fontWeight: vars.fontWeight.black,
    letterSpacing: '-0.04em',
    lineHeight: 1.2,
  }),
)
