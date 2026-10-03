import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import {
  checkboxBox,
  checkboxInput,
  checkboxLabel,
  checkboxMark,
  checkboxText,
} from './Checkbox.css'
import { cx } from './cx'

/**
 * 디자인 시스템 체크박스 — 네이티브 `<input type="checkbox">` 를 `peer sr-only` 로 감추고,
 * 형제 박스(체크마크 SVG)를 `peer-checked:` 로 칠한다. 접근성·키보드·폼 제출·RHF 를 네이티브에
 * 그대로 위임하되 시각만 토큰화한다.
 *
 * ref 는 내부 실제 `<input>` 을 노출한다(`Field` 와 동일 — `{focus,blur}` 만 노출하면 RHF
 * defaultValues 가 깨진다).
 *
 * 라벨 텍스트 색은 강제하지 않고 **부모에서 상속** — 라이트 폼이든 다크 밴드든 감싼 문맥 색을 따른다.
 * 박스 배경은 `bg-surface`/`border-border`(라이트 스킴 세만틱), 체크 시 `accent`.
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 체크박스 우측 라벨/설명 슬롯. */
  children?: ReactNode
  /** 감싸는 `<label>` 추가 클래스(그리드 배치·간격 등). */
  containerClassName?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, className, containerClassName, ...rest },
  ref,
) {
  return (
    <label className={cx(checkboxLabel, containerClassName)}>
      <input ref={ref} type="checkbox" className={cx(checkboxInput, className)} {...rest} />
      <span aria-hidden="true" className={checkboxBox}>
        <svg
          viewBox="0 0 12 12"
          className={checkboxMark}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.3 4.8 8.6 9.5 3.6" />
        </svg>
      </span>
      {children ? <span className={checkboxText}>{children}</span> : null}
    </label>
  )
})
