import type { HTMLAttributes, ReactNode } from 'react'
import { CoverBlock, cx } from '../primitives'
import { renderAsChild } from './as-child'
import * as s from './MediaRow.css'
import * as t from './thumb.css'

/**
 * 미디어 줄 — Figma `1028:331`. 포스터 썸네일 · 시각 키커 · 제목 · 메타 · 아래 줄 · 오른쪽 칸.
 * `PickRow` 에 썸네일을 더한 것. 고른 줄은 `selected`, 고른 뒤 나머지는 `dimmed`.
 */
export interface MediaRowProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** `asChild` 면 비우고 자식 링크의 글로 준다. */
  title?: ReactNode
  posterUrl?: string
  /** 포스터가 없을 때 색면 위 글자 — 보통 이니셜. */
  cover?: ReactNode
  /** 제목 위 Geist 키커 — `토 10.10 · 12:00`. */
  kicker?: ReactNode
  /** 제목 아래 — 장소. */
  meta?: ReactNode
  /** 맨 아래 줄 — 가격 · 판매처 칩. */
  footer?: ReactNode
  /** 오른쪽 칸 — 보통 `StatPill`. */
  aside?: ReactNode
  selected?: boolean
  dimmed?: boolean
  /** 자기 엘리먼트 대신 자식(`button` · 라우터 `Link`)에 줄을 입힌다. */
  asChild?: boolean
}

export function MediaRow({
  title,
  posterUrl,
  cover,
  kicker,
  meta,
  footer,
  aside,
  selected,
  dimmed,
  asChild,
  className,
  children,
  ...rest
}: MediaRowProps) {
  const cls = cx(s.root, className)
  const state = { 'data-selected': selected || undefined, 'data-dimmed': dimmed || undefined }
  const layout = (titleNode: ReactNode) => (
    <>
      <CoverBlock className={s.thumb}>
        {posterUrl ? <img src={posterUrl} alt="" loading="lazy" className={t.image} /> : cover}
      </CoverBlock>
      <span className={s.text}>
        {kicker ? <span className={s.kicker}>{kicker}</span> : null}
        <span className={s.title}>{titleNode}</span>
        {meta ? <span className={s.meta}>{meta}</span> : null}
        {footer ? <span className={s.footer}>{footer}</span> : null}
      </span>
      {aside ? <span className={s.aside}>{aside}</span> : null}
    </>
  )

  if (asChild) {
    const el = renderAsChild(children, cls, layout, state)
    if (el) return el
  }
  return (
    <article className={cls} {...state} {...rest}>
      {layout(title)}
    </article>
  )
}
