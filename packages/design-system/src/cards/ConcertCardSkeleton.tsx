import type { HTMLAttributes } from 'react'
import type { ConcertCardVariant } from '../contract'
import { pulse } from '../css/motion.css'
import { CoverBlock, cx } from '../primitives'
import type { ConcertCardSize } from './ConcertCard'
import * as s from './ConcertCardSkeleton.css'

/**
 * ConcertCard 의 로딩 스켈레톤 — 같은 섀시(rounded·border·커버 면)로 로드 전후 라운드·테두리·
 * 커버 색면이 튀지 않는다. `CoverBlock` 을 재사용해 면이 실카드와 정확히 같은 소스에서 나온다.
 *
 * **면에 축이 없다.** 예전엔 소비처(레일)가 6톤을 index 로 분산 주입했는데, 스켈레톤이 뜻하는 건
 * 「아직 그림이 없다」라서 `Skeleton`(막대들)과 밝기가 갈리면 안 된다 — 둘 다 `note` 다.
 * router·데이터 비의존.
 */
export interface ConcertCardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `ConcertCard` 의 같은 이름 prop 과 짝 — 섀시가 어긋나면 로드 전후가 튄다. */
  variant?: ConcertCardVariant
  /** `ConcertCard` 의 같은 이름 prop 과 짝 — **`cover` 전용**. 어긋나면 높이가 튄다. */
  size?: ConcertCardSize
  /** `ConcertCard` 의 같은 이름 prop 과 짝 — 제목 자리 높이를 실카드와 맞춘다. */
  reserveTitleLines?: boolean
}

/**
 * 짝 문들이 받는 것 — 축(`variant`·`size`)은 **문 이름이 이미 골랐다.**
 *
 * `reserveTitleLines` 도 빠진다. 그 축은 `bare` 섀시만 보고, 나머지 문에 넘기면 아무 일도 안
 * 일어난다 — 실카드 쪽에서 `initial`·`footer` 로 고친 것과 같은 병이다.
 */
export type ConcertCardSkeletonSlotProps = Omit<
  ConcertCardSkeletonProps,
  'variant' | 'size' | 'reserveTitleLines'
>

/** `ConcertCardSkeleton.Bare` 가 받는 것 — 위와 같고 `reserveTitleLines` 하나가 더 있다. */
export type BareConcertCardSkeletonProps = ConcertCardSkeletonSlotProps &
  Pick<ConcertCardSkeletonProps, 'reserveTitleLines'>

export function ConcertCardSkeleton({
  variant = 'framed',
  size = 'full',
  reserveTitleLines = false,
  className,
  ...rest
}: ConcertCardSkeletonProps) {
  if (variant === 'cover') {
    // 실카드와 같은 선 — `full` 만 커버 **밖**에 메타 한 줄을 두므로 그쪽만 바가 하나 더 붙는다.
    const textInside = size !== 'full'
    return (
      <div aria-hidden="true" className={cx(s.coverRoot, className)} {...rest}>
        <CoverBlock className={cx(s.coverCover({ size }), pulse)} />
        {textInside ? null : <div className={cx(s.coverBar, pulse)} />}
      </div>
    )
  }

  if (variant === 'bare') {
    return (
      <div aria-hidden="true" className={cx(s.bareRoot, className)} {...rest}>
        <CoverBlock className={cx(s.bareCover, pulse)} />
        <div className={s.bareMeta}>
          <div className={cx(s.titleBar({ reserve: reserveTitleLines }), pulse)} />
          <div className={cx(s.lineBarShort, pulse)} />
          <div className={cx(s.lineBarLong, pulse)} />
        </div>
      </div>
    )
  }

  return (
    <div aria-hidden="true" className={cx(s.framedRoot, className)} {...rest}>
      <CoverBlock className={cx(s.framedCover, pulse)} />
      <div className={s.framedBody}>
        <div className={cx(s.framedBar1, pulse)} />
        <div className={cx(s.framedBar2, pulse)} />
        <div className={cx(s.framedBar3, pulse)} />
      </div>
    </div>
  )
}

/**
 * 실카드의 문과 **1:1 짝** — 같은 이름으로 부르면 섀시·치수가 어긋날 자리가 없다.
 *
 * 축을 플래그로 넘기던 시절엔 짝을 **소비처가 기억해야** 했다. 그래서 `/live-events` 그리드가
 * 카드는 `CoverLarge`(420/460)로 바꾸고 스켈레톤은 `framed`(280)에 남는 일이 실제로 났다 —
 * 타입은 통과하고 화면만 로드 순간에 튄다. 문 이름이 짝을 말하면 그 사고가 성립하지 않는다.
 *
 * ⚠️ `variant`·`size` prop 은 그대로 산다 — 발행된 축이라 빼면 major 다. 문이 정확한 쪽이고
 * 플래그가 관대한 쪽인 것도 실카드와 같다.
 */
ConcertCardSkeleton.Framed = (props: ConcertCardSkeletonSlotProps) => (
  <ConcertCardSkeleton {...props} variant="framed" />
)
ConcertCardSkeleton.Bare = ({ reserveTitleLines, ...props }: BareConcertCardSkeletonProps) => (
  <ConcertCardSkeleton {...props} variant="bare" reserveTitleLines={reserveTitleLines} />
)
ConcertCardSkeleton.Cover = (props: ConcertCardSkeletonSlotProps) => (
  <ConcertCardSkeleton {...props} variant="cover" size="full" />
)
ConcertCardSkeleton.CoverCompact = (props: ConcertCardSkeletonSlotProps) => (
  <ConcertCardSkeleton {...props} variant="cover" size="compact" />
)
ConcertCardSkeleton.CoverLarge = (props: ConcertCardSkeletonSlotProps) => (
  <ConcertCardSkeleton {...props} variant="cover" size="large" />
)
