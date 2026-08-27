import { cx } from './cx'
import { dot, root } from './ThinkingDots.css'

/**
 * 생각 중 표시 — 점 셋이 차례로 밝아진다.
 *
 * `Spinner` 와 의미 어휘가 다르다: Spinner 는 *네트워크가 도는 중*(로딩 링),
 * 이쪽은 *상대가 답을 고르는 중*. 대화 버블 안에 들어가는 용도라 지름 6px 로 작다.
 */
export interface ThinkingDotsProps {
  /** 스크린리더에 읽힐 문구. 기본 "답을 고르는 중". */
  label?: string
  className?: string
}

export function ThinkingDots({ label = '답을 고르는 중', className }: ThinkingDotsProps) {
  return (
    <span role="status" aria-label={label} className={cx(root, className)}>
      <span aria-hidden className={dot} />
      <span aria-hidden className={dot} />
      <span aria-hidden className={dot} />
    </span>
  )
}
