import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/** 매거진 리드 피처 — 시안의 `THIS WEEK'S PICK`. 커버 + 텍스트 2단(모바일 스택). */
export const root = style(
  inComponentsLayer({
    display: 'grid',
    overflow: 'hidden',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    '@media': { [media.tablet]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
  }),
)

export const cover = style(
  inComponentsLayer({
    minHeight: 220,
    '@media': { [media.tablet]: { minHeight: 380 } },
  }),
)

export const coverImage = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)

export const body = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    '@media': { [media.tablet]: { padding: 44 } },
  }),
)

export const title = style(
  inComponentsLayer({
    fontFamily: vars.font.serif,
    fontSize: vars.fontSize['3xl'],
    fontWeight: vars.fontWeight.medium,
    lineHeight: vars.lineHeight.tight,
    color: vars.color.strong,
    '@media': { [media.tablet]: { fontSize: vars.fontSize['4xl'] } },
  }),
)

export const excerpt = style(
  inComponentsLayer({ fontSize: vars.fontSize.base, color: vars.color.muted }),
)

export const byline = style(
  inComponentsLayer({
    fontFamily: vars.font.mono,
    fontSize: vars.fontSize.xs,
    color: vars.color.subtle,
  }),
)

export const cta = style(
  inComponentsLayer({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.accent,
  }),
)
