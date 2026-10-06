import type { HTMLAttributes, ReactNode } from 'react'
import { CoverBlock, cx } from '../primitives'
import * as s from './PosterThumb.css'
import * as t from './thumb.css'

/**
 * 포스터 썸네일 — Figma `1028:217`. 3:4 포스터 한 장 + 왼쪽 아래 배지. 폭을 채우므로 칸 폭은 소비처 그리드가 정한다.
 * 포스터가 없으면 `cover`(보통 이니셜)를 색면 위에 둔다.
 */
export interface PosterThumbProps extends HTMLAttributes<HTMLDivElement> {
  posterUrl?: string
  cover?: ReactNode
  /** 이미지 대체 글. 옆에 제목이 있으면 비운다(기본). */
  alt?: string
  /** 왼쪽 아래 — 보통 `StatPill`. */
  badge?: ReactNode
}

export function PosterThumb({
  posterUrl,
  cover,
  alt = '',
  badge,
  className,
  ...rest
}: PosterThumbProps) {
  return (
    <CoverBlock className={cx(s.root, className)} {...rest}>
      {posterUrl ? <img src={posterUrl} alt={alt} loading="lazy" className={t.image} /> : cover}
      {badge ? <span className={s.badge}>{badge}</span> : null}
    </CoverBlock>
  )
}
