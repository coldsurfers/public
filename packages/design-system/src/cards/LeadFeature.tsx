import { CoverBlock, cx, Eyebrow } from '../primitives'
import type { CoverTone } from '../tokens'
import * as s from './LeadFeature.css'

/**
 * 매거진 리드 피처 — 시안의 `THIS WEEK'S PICK`. 커버 + 텍스트 2단(모바일 스택).
 * router 비의존 — 클릭은 소비처가 `Link` 로 감싼다.
 */
export interface LeadFeatureProps {
  tone: CoverTone
  /** 실제 커버 URL. 있으면 tone 색면 위에 채워 얹고, 없으면 색면만 노출(데이터 정직성). */
  thumbnailUrl?: string
  /** 상단 eyebrow — `THIS WEEK'S PICK`. */
  eyebrow?: string
  title: string
  excerpt: string
  /** `tomwaters · 7월 3주`. */
  byline: string
  /** 액션 라벨 — `읽기 →`. 없으면 미노출. */
  cta?: string
  className?: string
}

export function LeadFeature({
  tone,
  thumbnailUrl,
  eyebrow,
  title,
  excerpt,
  byline,
  cta,
  className,
}: LeadFeatureProps) {
  return (
    <article className={cx(s.root, className)}>
      <CoverBlock tone={tone} className={s.cover}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" loading="lazy" className={s.coverImage} />
        ) : null}
      </CoverBlock>
      <div className={s.body}>
        {eyebrow ? (
          <Eyebrow size="sm" tone="accent">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h2 className={s.title}>{title}</h2>
        <p className={s.excerpt}>{excerpt}</p>
        <p className={s.byline}>{byline}</p>
        {cta ? <span className={s.cta}>{cta}</span> : null}
      </div>
    </article>
  )
}
