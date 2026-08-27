import {
  type ButtonHTMLAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { button, buttonIcon } from './Button.css'
import { cx } from './cx'

/**
 * 액션 버튼.
 *   variant="primary" → ink 필 + paper 텍스트. 시안의 `취향 이어보기 →` CTA
 *   variant="ghost"   → 무테 텍스트 액션. 시안의 `읽기 →` · `취향 다시 고르기 ↻`
 *   variant="accent"  → 러스트 필 + 흰 텍스트. 랜딩 히어로 프라이머리 CTA
 *   variant="outline" → 흰 배경 + 테두리. 랜딩 히어로 세컨더리 CTA
 * `trailingIcon` 은 라벨 뒤 아이콘(화살표 등) 슬롯.
 * `asChild` 면 <button> 대신 자식 엘리먼트(예: 라우터 Link)에 스타일을 입혀 렌더한다 —
 * 라우팅 CTA 를 실제 <a> 로 내보낼 때. 자식은 단일 엘리먼트여야 하며 라벨은 그 children.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'cta'
  trailingIcon?: ReactNode
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', trailingIcon, className, children, type, asChild, ...rest },
  ref,
) {
  const cls = cx(button({ variant, size }), className)
  const icon = trailingIcon ? <span className={buttonIcon}>{trailingIcon}</span> : null

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>
    return cloneElement(
      child,
      { className: cx(cls, child.props.className) },
      child.props.children,
      icon,
    )
  }

  return (
    <button ref={ref} type={type ?? 'button'} className={cls} {...rest}>
      {children}
      {icon}
    </button>
  )
})
