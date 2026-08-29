import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 매거진 아티클 카드 — 썸네일 + 본문. */
export const card = style(
  inComponentsLayer({
    overflow: 'hidden',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
  }),
)

export const cover = style(inComponentsLayer({ height: 192 }))

/** tone 색면 위를 채우는 실제 썸네일. */
export const coverImage = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)

export const body = style(inComponentsLayer({ padding: 20 }))

export const title = style(
  inComponentsLayer({
    marginTop: 12,
    fontSize: vars.fontSize.lg,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.strong,
  }),
)

export const excerpt = style(
  inComponentsLayer({
    marginTop: 8,
    fontSize: vars.fontSize.sm,
    color: vars.color.muted,
  }),
)

export const meta = style(
  inComponentsLayer({
    marginTop: 16,
    fontFamily: vars.font.mono,
    fontSize: vars.fontSize.xs,
    color: vars.color.subtle,
  }),
)
