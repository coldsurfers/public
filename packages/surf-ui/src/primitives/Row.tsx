import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx } from './cx'
import {
  row,
  rowDate,
  rowDateDay,
  rowDateDow,
  rowDim,
  rowLead,
  rowSub,
  rowText,
  rowTime,
  rowTitle,
  rowTrail,
} from './Row.css'

const chevron = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
)

/**
 * 목록 한 줄 — 앞 칸 · 제목 · 부제 · 오른쪽 행동.
 * 줄마다 자기 행동을 갖는다: 기본 `trail` 은 `›`. 바깥 링크면 `↗` 아이콘, 지난 것이면 `종료` 표시를 넘긴다.
 * `asChild` 면 자식 엘리먼트(라우터 Link)에 줄 스타일을 입힌다.
 */
export interface RowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  lead?: ReactNode
  title: ReactNode
  sub?: ReactNode
  trail?: ReactNode
  /** 지난 줄 — 앞 칸과 글을 흐린다 */
  past?: boolean
  asChild?: boolean
}

export function Row({
  lead,
  title,
  sub,
  trail = chevron,
  past = false,
  asChild,
  className,
  children,
  ...rest
}: RowProps) {
  const dim = past ? rowDim : undefined
  const body = (
    <>
      {lead ? <span className={cx(rowLead, dim)}>{lead}</span> : null}
      <span className={cx(rowText, dim)}>
        <span className={rowTitle}>{title}</span>
        {sub ? <span className={rowSub}>{sub}</span> : null}
      </span>
      {trail ? <span className={rowTrail}>{trail}</span> : null}
    </>
  )
  const cls = cx(row, className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, { className: cx(cls, child.props.className) }, body)
  }

  return (
    <div className={cls} {...rest}>
      {body}
    </div>
  )
}

/** 앞 칸 — 시각. `19:30` */
export function RowTime({ children }: { children: ReactNode }) {
  return <span className={rowTime}>{children}</span>
}

/** 앞 칸 — 날짜 블록. `SAT` / `03` */
export function RowDate({ dow, day }: { dow: ReactNode; day: ReactNode }) {
  return (
    <span className={rowDate}>
      <span className={rowDateDow}>{dow}</span>
      <span className={rowDateDay}>{day}</span>
    </span>
  )
}
