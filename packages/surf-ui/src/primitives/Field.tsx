import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx'
import { fieldInput, fieldShell, fieldTrailing } from './Field.css'

/**
 * 테두리 입력 셸 — 시안의 `아티스트나 장르 하나…` 검색 필드.
 * `trailing` 은 우측 슬롯(↵ 힌트·버튼 등).
 *
 * ref 는 내부 실제 `<input>` 을 그대로 노출한다(RHF defaultValues 호환 — `{focus,blur}` 만
 * 노출하면 깨진다).
 */
export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  trailing?: ReactNode
  containerClassName?: string
  /** 깔린 표면. `dark` 는 다크 밴드(`color.strong`) 위 — 기본은 라이트 표면. */
  tone?: 'light' | 'dark'
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { trailing, className, containerClassName, tone = 'light', ...rest },
  ref,
) {
  return (
    <div className={cx(fieldShell({ tone }), containerClassName)}>
      <input ref={ref} className={cx(fieldInput({ tone }), className)} {...rest} />
      {trailing ? <span className={fieldTrailing}>{trailing}</span> : null}
    </div>
  )
})
