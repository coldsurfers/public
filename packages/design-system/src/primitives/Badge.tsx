import type { HTMLAttributes } from 'react'
import { badge, badgeDot } from './Badge.css'
import { cx } from './cx'

/**
 * 카드 위 작은 표식.
 *   variant="solid" → ink 필 mono 라벨. 시안의 `SEED`
 *   variant="soft"  → 무테 subtle 메타. 시안의 `96% 취향` (dot 로 선행 점)
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'soft'
  dot?: boolean
}

export function Badge({
  variant = 'solid',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cx(badge({ variant }), className)} {...rest}>
      {dot ? <span className={badgeDot} /> : null}
      {children}
    </span>
  )
}
