import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { listCard, listCardFooter } from './ListCard.css'

/**
 * `Row` 몇 줄을 담는 카드 — 화면의 결정 칸에 하나.
 * `footer` 는 「18편 모두 ›」 같은 끝 줄이고, 누르면 나머지를 시트로 연다.
 */
export interface ListCardProps extends HTMLAttributes<HTMLDivElement> {
  footer?: ReactNode
}

export function ListCard({ footer, className, children, ...rest }: ListCardProps) {
  return (
    <div className={cx(listCard, className)} {...rest}>
      {children}
      {footer ? <div className={listCardFooter}>{footer}</div> : null}
    </div>
  )
}
