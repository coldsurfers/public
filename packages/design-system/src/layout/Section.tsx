import type { HTMLAttributes, ReactNode } from 'react'
import { cx, Eyebrow } from '../primitives'
import { container } from './Container.css'
import * as s from './Section.css'

export type SectionProps = HTMLAttributes<HTMLElement>

/** 표면 한 덩이 — `<section>` + gutter + 내부 세로 리듬. */
function SectionRoot({ className, ...rest }: SectionProps) {
  return <section className={cx(container, s.section, className)} {...rest} />
}

export interface SectionHeaderProps {
  /**
   * mono uppercase 라벨. **`string` 만 받는다** — 넓히는 건 minor, 좁히는 건 major 라
   * 실제 요구가 생기기 전까지 좁은 쪽에 선다.
   */
  eyebrow?: string
  title: ReactNode
  /** 오른쪽 끝 슬롯 — "전체 보기" 링크·필터 등. */
  action?: ReactNode
  /** 문서 개요상의 깊이. 시각은 같고 시맨틱만 바뀐다. */
  as?: 'h2' | 'h3'
  className?: string
}

/** 섹션 머리 — eyebrow · 제목 · 우측 액션 3슬롯. */
function SectionHeader({
  eyebrow,
  title,
  action,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cx(s.header, className)}>
      <div className={s.headerText}>
        {eyebrow ? <Eyebrow size="sm">{eyebrow}</Eyebrow> : null}
        <Heading className={s.title}>{title}</Heading>
      </div>
      {action ? <div className={s.action}>{action}</div> : null}
    </div>
  )
}

export const Section = Object.assign(SectionRoot, { Header: SectionHeader })
