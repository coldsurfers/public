import type { HTMLAttributes, ReactNode } from 'react'
import { CoverBlock, cx } from '../primitives'
import * as s from './PosterTile.css'
import * as p from './panel.css'

/**
 * 포스터 타일 — 큐레이션 컬렉션 한 칸(Figma `821:213`). 포스터 · 큰 제목 · 메타 · 오른쪽 행동.
 * `posterUrl` 이 없으면 `note` 색면만 둔다.
 */
export interface PosterTileProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  posterUrl?: string
  /** 제목 아래 — `10.03–04 · 12편`. */
  meta?: ReactNode
  /** 오른쪽 행동 — 보통 `RowAction`. */
  action?: ReactNode
}

export function PosterTile({
  title,
  posterUrl,
  meta,
  action,
  className,
  ...rest
}: PosterTileProps) {
  return (
    <article className={cx(s.root, className)} {...rest}>
      <CoverBlock className={s.poster}>
        {posterUrl ? <img src={posterUrl} alt="" loading="lazy" className={s.posterImage} /> : null}
      </CoverBlock>
      <div className={s.bar}>
        <div className={s.text}>
          <h3 className={cx(p.blackTitle, s.title)}>{title}</h3>
          {meta ? <div className={s.meta}>{meta}</div> : null}
        </div>
        {action}
      </div>
    </article>
  )
}
