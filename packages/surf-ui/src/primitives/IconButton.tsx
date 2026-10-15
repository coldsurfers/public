import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'
import type { ButtonShape, ButtonVariant, IconButtonSize } from '../contract'
import { cx } from './cx'
import { iconButton } from './IconButton.css'

export type { IconButtonSize }

/**
 * 아이콘만 있는 정사각 액션 — 닫기 · 뒤로 · 지우기 · 레일 아이콘. native `IconButton` 의 웹 짝.
 *   variant  → `Button` 과 같은 축. 기본 `ghost`(바탕 없음, hover 때 면)
 *   size     → `sm` 36 · `md` 44(터치 하한)
 *   shape    → `pill` 이면 원
 * 라벨이 없으므로 `label` 이 필수다 — `aria-label` 로 붙는다.
 */
export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  variant?: ButtonVariant
  size?: IconButtonSize
  shape?: ButtonShape
  /** 스크린 리더용 이름. */
  label: string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 'md', shape = 'rounded', label, className, type, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      className={cx(iconButton({ variant, size, shape }), className)}
      {...rest}
    >
      {children}
    </button>
  )
})
