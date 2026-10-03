import type { HTMLAttributes } from 'react'
import * as s from './CornerLabel.css'
import { cx } from './cx'

/**
 * 귀퉁이 라벨 — 묶음 왼쪽 위에 H2 대신 다는 영문 대문자 + 짧은 선(`THIS WEEK` / `IN SEOUL`).
 * 줄바꿈은 `\n` 을 그대로 쓴다. 두 줄을 넘기지 않는다.
 */
export type CornerLabelProps = HTMLAttributes<HTMLParagraphElement>

export function CornerLabel({ className, ...rest }: CornerLabelProps) {
  return <p className={cx(s.root, className)} {...rest} />
}
