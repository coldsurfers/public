import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { type StatPillTone, statPill } from './StatPill.css'

export type { StatPillTone }

/**
 * 숫자 칩 — Figma `1028:210`. 아이콘 + Geist 숫자(`👁 1,204` · `🔥 31`).
 * 무엇을 세는지는 모른다 — 숫자 포맷은 소비처가 넘긴다.
 */
export interface StatPillProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode
  value: ReactNode
  tone?: StatPillTone
}

export function StatPill({ icon, value, tone = 'neutral', className, ...rest }: StatPillProps) {
  return (
    <span className={cx(statPill[tone], className)} {...rest}>
      {icon ? <span aria-hidden>{icon}</span> : null}
      {value}
    </span>
  )
}
