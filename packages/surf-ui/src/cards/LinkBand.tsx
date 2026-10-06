import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../primitives'
import { renderAsChild } from './as-child'
import * as s from './LinkBand.css'

/**
 * 링크 띠 — Figma `1028:431`(키커 + 한 줄 + `판 보기 ›`) · `1028:468`(큰 숫자 + 한 줄 + `›`).
 * 다른 묶음으로 넘기는 한 줄. 링크는 `asChild`.
 */
export interface LinkBandProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** `asChild` 면 비우고 자식 링크의 글로 준다. */
  title?: ReactNode
  /** 제목 위 Geist 키커 — `CHOICE #031 에 실림`. */
  kicker?: ReactNode
  /** 왼쪽 큰 Geist 숫자 — `#031`. */
  lead?: ReactNode
  /** 오른쪽 행동 글자. 기본 `›`. */
  action?: ReactNode
  asChild?: boolean
}

export function LinkBand({
  title,
  kicker,
  lead,
  action = '›',
  asChild,
  className,
  children,
  ...rest
}: LinkBandProps) {
  const cls = cx(s.root, className)
  const layout = (titleNode: ReactNode) => (
    <>
      {lead ? <span className={s.lead}>{lead}</span> : null}
      <span className={s.text}>
        {kicker ? <span className={s.kicker}>{kicker}</span> : null}
        <span className={s.title}>{titleNode}</span>
      </span>
      <span className={s.action}>{action}</span>
    </>
  )

  if (asChild) {
    const el = renderAsChild(children, cls, layout)
    if (el) return el
  }
  return (
    <div className={cls} {...rest}>
      {layout(title)}
    </div>
  )
}
