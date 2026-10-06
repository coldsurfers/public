import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 포스터 썸네일 — Figma `1028:217`. 3:4 · r12 · 왼쪽 아래 배지. 폭은 소비처가 준다. */
export const root = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: '3 / 4',
    borderRadius: vars.shape.radiusRow,
    fontSize: 32,
    fontWeight: vars.fontWeight.black,
  }),
)

export const badge = style(
  inComponentsLayer({ position: 'absolute', left: 8, bottom: 8, display: 'flex' }),
)
