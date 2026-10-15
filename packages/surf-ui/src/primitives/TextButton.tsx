import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from './cx'
import { textButton } from './TextButton.css'

export type TextButtonTone = 'muted' | 'danger'

/**
 * 문장에 섞이는 글자 단추 — 「전체 지우기」 · 「이메일 바꾸기」 · 「다시 시도」. 패딩 · 바탕 없이 흐린 글자.
 * 면이 있는 액션은 `Button`(`ghost` 포함)이다. 웹에만 있다 — RN 소비처가 생기면 계약으로 올린다.
 */
export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: TextButtonTone
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(function TextButton(
  { tone = 'muted', className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cx(textButton({ tone }), className)}
      {...rest}
    />
  )
})
