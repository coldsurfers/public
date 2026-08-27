import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'
import { chip } from './Chip.css'
import { cx } from './cx'

/**
 * Pill — 시안의 4 맥락을 한 어휘로 덮는다.
 *   size="md"  → rounded-full 필. quick chips(Boris…) · section chips(전체·Reviews) · filter(오늘·이번 주)
 *   size="sm"  → 소형 tag. genre 태그(드론·스토너·슈게이즈)
 *   active     → 선택 상태. ink 필 + paper 텍스트 (오늘·전체 등)
 * 상호작용이면 기본 `button`, 라벨이면 `as="span"`.
 */
type ChipBase = { active?: boolean; size?: 'sm' | 'md' }

export type ChipProps =
  | (ChipBase & { as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (ChipBase & { as: 'span' } & HTMLAttributes<HTMLSpanElement>)

export function Chip(props: ChipProps) {
  if (props.as === 'span') {
    const { active = false, size = 'md', as: _as, className, ...rest } = props
    return <span className={cx(chip({ size, active }), className)} {...rest} />
  }
  const { active = false, size = 'md', as: _as, className, type, ...rest } = props
  return (
    <button type={type ?? 'button'} className={cx(chip({ size, active }), className)} {...rest} />
  )
}
