import type { HTMLAttributes, ReactNode } from 'react'
import { CoverBlock, cx } from '../primitives'
import { renderAsChild } from './as-child'
import * as s from './InfoRow.css'

/**
 * 정보 줄 — Figma `1028:461`. 썸네일 · 이름 · 부제 · `›`. 줄 전체가 한 곳으로 간다(공연장 · 링크).
 * 링크는 `asChild` 로 — `<InfoRow asChild title="…"><Link to="…" /></InfoRow>`.
 */
export interface InfoRowProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  /** 이름 아래 한 줄 — `동대문구 · 다가오는 5`. */
  meta?: ReactNode
  /** 왼쪽 44 칸 — 이미지 · 아이콘 · 이니셜. 없으면 빈 색면. */
  thumb?: ReactNode
  asChild?: boolean
}

export function InfoRow({
  title,
  meta,
  thumb,
  asChild,
  className,
  children,
  ...rest
}: InfoRowProps) {
  const cls = cx(s.root, className)
  const content = (
    <>
      <CoverBlock className={s.thumb}>{thumb}</CoverBlock>
      <span className={s.text}>
        <span className={s.title}>{title}</span>
        {meta ? <span className={s.meta}>{meta}</span> : null}
      </span>
      <span className={s.chevron} aria-hidden>
        ›
      </span>
    </>
  )

  if (asChild) {
    const el = renderAsChild(children, cls, content)
    if (el) return el
  }
  return (
    <div className={cls} {...rest}>
      {content}
    </div>
  )
}
