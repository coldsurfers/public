import type { HTMLAttributes } from 'react'
import { cx } from './cx'
import { eyebrow } from './Eyebrow.css'

/**
 * mono uppercase 라벨 — 시안의 `TOMWATERS TASTE ENGINE` · `LIVE · 이번 주 홍대` ·
 * `ISSUE 07` · 카테고리(TAPE·MIND·DEV) · `THIS WEEK'S PICK`.
 *   tone: 카테고리·PICK = `accent`(brand red), LIVE·ISSUE = `muted`.
 */
export interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md'
  tone?: 'muted' | 'subtle' | 'accent'
}

export function Eyebrow({ size = 'md', tone = 'muted', className, ...rest }: EyebrowProps) {
  return <p className={cx(eyebrow({ size, tone }), className)} {...rest} />
}
