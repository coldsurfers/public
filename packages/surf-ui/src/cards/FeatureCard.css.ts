import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 기능 카드 — Figma `821:376`. 제목 · 한 줄 · 행동 하나. */
export const root = style(inComponentsLayer({ alignItems: 'flex-start', gap: 16, padding: 24 }))

export const text = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'stretch' }),
)

export const title = style(inComponentsLayer({ fontSize: 24 }))

export const description = style(
  inComponentsLayer({
    margin: 0,
    fontSize: vars.shape.typeBody,
    color: vars.color.textSecondary,
  }),
)
