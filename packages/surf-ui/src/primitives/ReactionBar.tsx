import type { FieldsetHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import * as s from './ReactionBar.css'

export interface ReactionItem {
  id: string
  label: ReactNode
  count?: number
}

interface ReactionBarBase extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  items: readonly ReactionItem[]
}

/** 하나만 켠다 — 켠 것을 다시 누르면 `onChange(null)`. */
export interface ReactionBarSingleProps extends ReactionBarBase {
  multiple?: false
  value: string | null
  onChange: (id: string | null) => void
}

/** 여러 개를 켠다 — 칸마다 따로 켜고 끄고, 누른 칸과 켜질지를 넘긴다. */
export interface ReactionBarMultipleProps extends ReactionBarBase {
  multiple: true
  value: readonly string[]
  onChange: (id: string, on: boolean) => void
}

/**
 * 반응 줄 — Figma `1028:400`(`🔥 갈래 22` · `🤔 고민 9` · `💸 비싸 4`). 기본은 하나만, `multiple` 이면 여럿.
 * 낙관적 숫자 갱신은 소비처가 `items` 로 넘긴다. 잠그려면 `disabled` — `fieldset` 이 안의 버튼을 함께 끈다.
 */
export type ReactionBarProps = ReactionBarSingleProps | ReactionBarMultipleProps

export function ReactionBar(props: ReactionBarProps) {
  const { items, value, onChange, multiple, className, ...rest } = props
  const isPressed = (id: string) => (props.multiple ? props.value.includes(id) : id === props.value)
  const press = (id: string, pressed: boolean) => {
    if (props.multiple) props.onChange(id, !pressed)
    else props.onChange(pressed ? null : id)
  }
  return (
    <fieldset className={cx(s.bar, className)} {...rest}>
      {items.map((item) => {
        const pressed = isPressed(item.id)
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={pressed}
            className={s.item}
            onClick={() => press(item.id, pressed)}
          >
            {item.label}
            {item.count != null ? <span className={s.count}>{item.count}</span> : null}
          </button>
        )
      })}
    </fieldset>
  )
}
