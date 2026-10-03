import { type ButtonHTMLAttributes, cloneElement, isValidElement, type ReactElement } from 'react'
import { cx } from './cx'
import { rowAction } from './RowAction.css'

/**
 * 줄 행동 버튼 — 줄 · 타일 · 카드마다 붙는 작은 행동(`예매 ↗` · `알림` · `보기`).
 * 화면의 주 행동 하나는 `Button variant="accent"` 로 두고, 나머지 반복 행동은 이걸 쓴다.
 */
export interface RowActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 자기 엘리먼트 대신 자식(라우터 `Link` · `<a>`)에 스타일을 입힌다. */
  asChild?: boolean
}

export function RowAction({ asChild, className, type, children, ...rest }: RowActionProps) {
  const cls = cx(rowAction, className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, { className: cx(cls, child.props.className) })
  }

  return (
    <button type={type ?? 'button'} className={cls} {...rest}>
      {children}
    </button>
  )
}
