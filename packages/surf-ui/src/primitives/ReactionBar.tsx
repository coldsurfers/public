import type { FieldsetHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import * as s from './ReactionBar.css'

export interface ReactionItem {
  id: string
  label: ReactNode
  count?: number
}

/**
 * 반응 줄 — Figma `1028:400`(`🔥 갈래 22` · `🤔 고민 9` · `💸 비싸 4`). 하나만 켠다 —
 * 켠 것을 다시 누르면 `onChange(null)`. 낙관적 숫자 갱신은 소비처가 `items` 로 넘긴다.
 * 잠그려면 `disabled` — `fieldset` 이 안의 버튼을 함께 끈다.
 */
export interface ReactionBarProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  items: readonly ReactionItem[]
  value: string | null
  onChange: (id: string | null) => void
}

export function ReactionBar({ items, value, onChange, className, ...rest }: ReactionBarProps) {
  return (
    <fieldset className={cx(s.bar, className)} {...rest}>
      {items.map((item) => {
        const pressed = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={pressed}
            className={s.item}
            onClick={() => onChange(pressed ? null : item.id)}
          >
            {item.label}
            {item.count != null ? <span className={s.count}>{item.count}</span> : null}
          </button>
        )
      })}
    </fieldset>
  )
}
