import { styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 3,
  height: 19,
  paddingInline: 7,
  borderRadius: vars.shape.radiusPill,
  fontFamily: vars.font.geist,
  fontSize: 11,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: 1,
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
} as const

/** 숫자 칩 — Figma `1028:210`. `neutral` 은 줄 면, `hot` 은 주황 틴트. */
export const statPill = styleVariants(
  {
    neutral: { ...base, background: vars.color.rowFill, color: vars.color.textSecondary },
    hot: { ...base, background: vars.color.statusWarningBg, color: vars.color.statusWarning },
  },
  inComponentsLayer,
)

export type StatPillTone = keyof typeof statPill
