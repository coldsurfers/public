import { pulse } from '../css/motion.css'
import { CoverBlock, cx } from '../primitives'
import type { CoverTone } from '../tokens'
import * as s from './ConcertCardSkeleton.css'

/**
 * ConcertCard 의 로딩 스켈레톤 — 같은 섀시(rounded·border·cover tone 커버)로 로드 전후 라운드·
 * 테두리·커버 색면이 튀지 않는다. `CoverBlock` 을 재사용해 tone 색이 실카드와 정확히 같은 소스에서
 * 나온다. tone 은 소비처(레일)가 결정적으로 분산 주입한다. router·데이터 비의존.
 */
export interface ConcertCardSkeletonProps {
  /** 커버 색면 tone — 소비처가 index 등으로 분산 주입. */
  tone: CoverTone
  /** `ConcertCard` 의 같은 이름 prop 과 짝 — 섀시가 어긋나면 로드 전후가 튄다. */
  variant?: 'framed' | 'bare' | 'cover'
  /** `ConcertCard` 의 같은 이름 prop 과 짝 — 제목 자리 높이를 실카드와 맞춘다. */
  reserveTitleLines?: boolean
  className?: string
}

export function ConcertCardSkeleton({
  tone,
  variant = 'framed',
  reserveTitleLines = false,
  className,
}: ConcertCardSkeletonProps) {
  if (variant === 'cover') {
    return (
      <div aria-hidden="true" className={cx(s.coverRoot, className)}>
        <CoverBlock tone={tone} className={cx(s.coverCover, pulse)} />
        <div className={cx(s.coverBar, pulse)} />
      </div>
    )
  }

  if (variant === 'bare') {
    return (
      <div aria-hidden="true" className={cx(s.bareRoot, className)}>
        <CoverBlock tone={tone} className={cx(s.bareCover, pulse)} />
        <div className={s.bareMeta}>
          <div className={cx(s.titleBar({ reserve: reserveTitleLines }), pulse)} />
          <div className={cx(s.lineBarShort, pulse)} />
          <div className={cx(s.lineBarLong, pulse)} />
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={cx(s.framedRoot, className)}>
      <CoverBlock tone={tone} className={cx(s.framedCover, pulse)} />
      <div className={s.framedBody}>
        <div className={cx(s.framedBar1, pulse)} />
        <div className={cx(s.framedBar2, pulse)} />
        <div className={cx(s.framedBar3, pulse)} />
      </div>
    </div>
  )
}
