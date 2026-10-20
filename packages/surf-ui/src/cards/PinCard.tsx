'use client'

import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type SyntheticEvent,
  useState,
} from 'react'
import { PIN_CARD_SPEC } from '../contract'
import { cx } from '../primitives/cx'
import * as s from './PinCard.css'

/** 받아 본 포스터 비율(가로 ÷ 세로) — 칸이 다시 그려져도 3:4 에서 다시 옮겨 가지 않는다. */
const posterRatios = new Map<string, number>()

export interface PinCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 포스터 주소. 없으면 3:4 회색 자리. */
  poster?: string
  /** 포스터가 없을 때 회색 자리 안 글자. */
  fallback?: ReactNode
  /** 출처 한 줄 — 도메인 · 장소. */
  meta?: ReactNode
  /** 포스터 오른쪽 아래 — 보통 담기 ＋. 링크 밖 형제라 단추를 넣어도 된다. */
  action?: ReactNode
  /** 제목. 링크 엘리먼트 하나면 그 링크가 카드 전체를 덮는다. */
  children: ReactNode
}

/**
 * 핀 한 장 — 시안 v3 `v3/PinCard`. 여러 장을 놓는 다단 그리드는 `Masonry`.
 * 포스터는 3:4 자리에서 받은 비율로 부드럽게 옮겨 간다.
 * @example
 * <PinCard poster={src} meta="ticketlink.co.kr" action={<SaveButton />}>
 *   <Link href="/pin/x">MOBO 인디 뮤직 페스티벌</Link>
 * </PinCard>
 */
export function PinCard({
  poster,
  fallback,
  meta,
  action,
  children,
  className,
  ...rest
}: PinCardProps) {
  return (
    <div className={cx(s.root, className)} {...rest}>
      <span className={s.posterBox}>
        {poster ? <Poster src={poster} /> : <span className={s.posterEmpty}>{fallback}</span>}
        {action ? <span className={s.action}>{action}</span> : null}
      </span>
      {isValidElement<{ className?: string }>(children) ? (
        cloneElement(children, { className: cx(s.title, s.titleLink, children.props.className) })
      ) : (
        <span className={s.title}>{children}</span>
      )}
      {meta ? <span className={s.meta}>{meta}</span> : null}
    </div>
  )
}

/**
 * 포스터 — 그려질 때 아직 안 받았으면 3:4 에 잡아 두고, 받으면 원래 비율로 옮겨 간다.
 * 이미 받은 포스터(하이드레이션 전 · 캐시)는 CSS `auto` 비율 그대로 두어 움직이지 않는다.
 */
function Poster({ src }: { src: string }) {
  const [ratio, setRatio] = useState<number | 'pending' | undefined>(() => posterRatios.get(src))
  const remember = (img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return undefined
    const next = img.naturalWidth / img.naturalHeight
    posterRatios.set(src, next)
    return next
  }
  return (
    <img
      ref={(img) => {
        if (!img || ratio !== undefined) return
        if (img.complete) remember(img)
        else setRatio('pending')
      }}
      src={src}
      alt=""
      loading="lazy"
      className={s.poster}
      style={{ aspectRatio: aspectOf(ratio) }}
      onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
        if (ratio === 'pending') setRatio(remember(event.currentTarget))
      }}
    />
  )
}

/** 인라인 비율 — 잡아 둔 동안 3:4, 받았으면 원래 비율, 그 밖엔 CSS 에 맡긴다. */
const aspectOf = (ratio: number | 'pending' | undefined) =>
  ratio === 'pending' ? `${PIN_CARD_SPEC.posterFallbackRatio}` : ratio ? `${ratio}` : undefined
