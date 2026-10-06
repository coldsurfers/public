import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import * as s from './KeyValueRow.css'

/** 이름 · 값 한 줄 — Figma `1028:387`. 좌석 등급 `VIP석 189,000원` 같은 줄. */
export interface KeyValueRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
}

export function KeyValueRow({ label, value, className, ...rest }: KeyValueRowProps) {
  return (
    <div className={cx(s.row, className)} {...rest}>
      <span className={s.label}>{label}</span>
      <span className={s.value}>{value}</span>
    </div>
  )
}
