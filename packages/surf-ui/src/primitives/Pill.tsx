import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cx } from './cx'
import { pill, pillIcon } from './Pill.css'

/**
 * 고른 값을 보여주고 누르면 고르는 시트를 연다 — `서울 ▾`.
 * 아래 화살표는 늘 붙는다(누르면 바뀐다는 표시). 앞 아이콘은 `icon` 슬롯.
 */
export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
}

export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  { icon, className, children, type, ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type ?? 'button'} className={cx(pill, className)} {...rest}>
      {icon ? <span className={pillIcon}>{icon}</span> : null}
      {children}
      <svg
        className={pillIcon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
})
