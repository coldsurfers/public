import { CoverBlock, cx, Eyebrow } from '../primitives'
import type { CoverTone } from '../tokens'
import * as s from './ArticleCard.css'

/**
 * 매거진 아티클 카드 — 썸네일(tone) + 본문(category eyebrow · title · excerpt · meta).
 * router 비의존 — 클릭은 소비처가 `Link` 로 감싼다.
 */
export interface ArticleCardProps {
  tone: CoverTone
  /** 실제 썸네일 URL. 있으면 tone 색면 위에 채워 얹고, 없으면 색면만 노출(데이터 정직성). */
  thumbnailUrl?: string
  /** 카테고리 eyebrow — `TAPE` · `MIND` · `DEV`. */
  category: string
  title: string
  excerpt: string
  /** `7.15 · 24분` · `7.11`. */
  meta: string
  className?: string
}

export function ArticleCard({
  tone,
  thumbnailUrl,
  category,
  title,
  excerpt,
  meta,
  className,
}: ArticleCardProps) {
  return (
    <article className={cx(s.card, className)}>
      <CoverBlock tone={tone} className={s.cover}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" loading="lazy" className={s.coverImage} />
        ) : null}
      </CoverBlock>
      <div className={s.body}>
        <Eyebrow size="sm" tone="accent">
          {category}
        </Eyebrow>
        <h3 className={s.title}>{title}</h3>
        <p className={s.excerpt}>{excerpt}</p>
        <p className={s.meta}>{meta}</p>
      </div>
    </article>
  )
}
