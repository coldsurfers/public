import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../primitives'
import * as s from './PickCard.css'
import * as p from './panel.css'

/**
 * 고르기 카드 — 공연 몇 개를 줄로 보여주고 줄마다 행동을 붙인다(Figma `821:92`).
 * 줄은 `PickRow` 를 children 으로 넣는다. 여러 장을 나란히 놓는 그리드는 소비처 몫이다.
 */
export interface PickCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 머리 한 줄 — `오늘 저녁`. */
  title: ReactNode
  /** 머리 아래 Geist 키커 — `TODAY · 10.01`. */
  kicker?: ReactNode
  /** 머리 오른쪽 슬롯 — 스웰 미터 같은 앱 부품. */
  aside?: ReactNode
  /** 꼬리 한 줄 — `18건 모두 ›` 링크. */
  footer?: ReactNode
}

export function PickCard({
  title,
  kicker,
  aside,
  footer,
  className,
  children,
  ...rest
}: PickCardProps) {
  return (
    <section className={cx(p.panel, s.root, className)} {...rest}>
      <header className={s.head}>
        <div className={s.headText}>
          <h3 className={p.cardHead}>{title}</h3>
          {kicker ? <span className={p.kicker}>{kicker}</span> : null}
        </div>
        {aside}
      </header>
      {children}
      {footer ? <div className={s.foot}>{footer}</div> : null}
    </section>
  )
}

export interface PickRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** 제목 앞 Geist 시각 — `19:30` · `토 18:00`. */
  time?: ReactNode
  title: ReactNode
  /** 둘째 줄 — 장소 · 태그. */
  meta?: ReactNode
  /** 오른쪽 행동 — 보통 `RowAction`. */
  action?: ReactNode
}

export function PickRow({ time, title, meta, action, className, ...rest }: PickRowProps) {
  return (
    <div className={cx(s.row, className)} {...rest}>
      <div className={s.rowText}>
        <div className={s.rowTitleLine}>
          {time ? <span className={s.rowTime}>{time}</span> : null}
          <h4 className={s.rowTitle}>{title}</h4>
        </div>
        {meta ? <div className={s.rowMeta}>{meta}</div> : null}
      </div>
      {action}
    </div>
  )
}
