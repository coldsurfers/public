import { cloneElement, type HTMLAttributes, isValidElement, type ReactNode } from 'react'
import { cx } from '../primitives'
import * as s from './PinCard.css'

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
 * 핀 한 장 — 시안 v3 `v3/PinCard`. 여러 장을 놓는 다단 그리드는 소비처 몫이다.
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
        {poster ? (
          <img src={poster} alt="" loading="lazy" className={s.poster} />
        ) : (
          <span className={s.posterEmpty}>{fallback}</span>
        )}
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
