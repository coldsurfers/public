import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../primitives'
import { renderAsChild } from './as-child'
import * as s from './PosterShelf.css'
import { PosterThumb } from './PosterThumb'

/**
 * 포스터 선반 — Figma `1028:452`(`SAME BOARD · #031` + 포스터 셋). 칸은 `PosterShelfItem` 을 children 으로.
 */
export interface PosterShelfProps extends HTMLAttributes<HTMLElement> {
  /** 머리 Geist 키커. */
  kicker?: ReactNode
}

export function PosterShelf({ kicker, className, children, ...rest }: PosterShelfProps) {
  return (
    <section className={cx(s.root, className)} {...rest}>
      {kicker ? <span className={s.kicker}>{kicker}</span> : null}
      <div className={s.track}>{children}</div>
    </section>
  )
}

export interface PosterShelfItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** `asChild` 면 비우고 자식 링크의 글로 준다. */
  title?: ReactNode
  posterUrl?: string
  cover?: ReactNode
  /** 제목 아래 Geist 한 줄 — `토 17:00`. */
  meta?: ReactNode
  badge?: ReactNode
  /** 칸 전체를 자식(라우터 `Link`)으로. */
  asChild?: boolean
}

export function PosterShelfItem({
  title,
  posterUrl,
  cover,
  meta,
  badge,
  asChild,
  className,
  children,
  ...rest
}: PosterShelfItemProps) {
  const cls = cx(s.item, className)
  const layout = (titleNode: ReactNode) => (
    <>
      <PosterThumb posterUrl={posterUrl} cover={cover} badge={badge} />
      <span className={s.itemTitle}>{titleNode}</span>
      {meta ? <span className={s.itemMeta}>{meta}</span> : null}
    </>
  )

  if (asChild) {
    const el = renderAsChild(children, cls, layout)
    if (el) return el
  }
  return (
    <article className={cls} {...rest}>
      {layout(title)}
    </article>
  )
}
