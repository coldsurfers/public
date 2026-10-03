import {
  type ButtonHTMLAttributes,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx } from '../primitives'
import * as s from './ChipCard.css'
import * as p from './panel.css'

/**
 * 칩 카드 — 「장르로 고르기」 · 「지역으로 고르기」(Figma `821:317`).
 * 칩은 `ChipCardItem` 을 children 으로 넣는다.
 */
export interface ChipCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 머리 한 줄 — `장르로 고르기`. */
  title: ReactNode
}

export function ChipCard({ title, className, children, ...rest }: ChipCardProps) {
  return (
    <section className={cx(p.panel, s.root, className)} {...rest}>
      <h3 className={p.cardHead}>{title}</h3>
      <div className={s.chips}>{children}</div>
    </section>
  )
}

export interface ChipCardItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode
  /** 라벨 뒤 Geist 개수 — `214`. */
  count?: ReactNode
  /** 자기 엘리먼트 대신 자식(라우터 `Link` · `<a>`)을 칩으로 쓴다. 자식의 내용은 라벨 · 개수로 바뀐다. */
  asChild?: boolean
}

export function ChipCardItem({
  label,
  count,
  asChild,
  className,
  type,
  children,
  ...rest
}: ChipCardItemProps) {
  const cls = cx(s.item, className)
  const content = (
    <>
      <span className={s.label}>{label}</span>
      {count !== undefined ? <span className={s.count}>{count}</span> : null}
    </>
  )

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>
    return cloneElement(child, { className: cx(cls, child.props.className) }, content)
  }

  return (
    <button type={type ?? 'button'} className={cls} {...rest}>
      {content}
    </button>
  )
}
