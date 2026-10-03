import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../primitives'
import * as s from './FeatureCard.css'
import * as p from './panel.css'

/** 기능 카드 — 서비스 소개 한 칸(Figma `821:376`). 제목 · 한 줄 · 행동 하나. */
export interface FeatureCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** 아래 행동 하나 — 보통 `RowAction`. */
  action?: ReactNode
}

export function FeatureCard({ title, description, action, className, ...rest }: FeatureCardProps) {
  return (
    <section className={cx(p.panel, s.root, className)} {...rest}>
      <div className={s.text}>
        <h3 className={cx(p.blackTitle, s.title)}>{title}</h3>
        {description ? <p className={s.description}>{description}</p> : null}
      </div>
      {action}
    </section>
  )
}
