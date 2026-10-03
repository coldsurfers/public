import type { ReactNode } from 'react'
import { cx } from './cx'
import { POPOVER_MENU_CLS, Popover } from './Popover'
import { selectCaret, selectMenu, selectOption, selectTrigger } from './Select.css'

/**
 * 단일 선택 드롭다운 — 트리거(현재값 + caret) + 팝오버 메뉴. 시안의 필터 select 펼침
 * (도시·장르). controlled·router/data 비의존 — 소비처가 `value`/`onChange` 를 들고,
 * 옵션 라벨만 넘긴다. 팝오버 뼈대(바깥클릭·Escape·위치잡기·maxHeight)는 `Popover` 가 소유.
 *
 * 트리거는 열림 상태에서 accent 테두리 + caret ▴ 로 활성 신호를 준다. 색·간격은 전부
 * semantic 토큰(surface·border·strong·accent) — 스코프된 팔레트를 그대로 따른다.
 */
export interface SelectOption {
  value: string
  label: ReactNode
}

export interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  /** 옵션 미매칭 시 트리거에 보일 폴백 라벨. 기본은 첫 옵션. */
  placeholder?: ReactNode
  className?: string
  menuClassName?: string
  'aria-label'?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  className,
  menuClassName,
  'aria-label': ariaLabel,
}: SelectProps) {
  const current = options.find((o) => o.value === value)

  return (
    <Popover
      role="listbox"
      className={className}
      menuClassName={cx(POPOVER_MENU_CLS, selectMenu, menuClassName)}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={toggle}
          className={selectTrigger({ open })}
        >
          {current?.label ?? placeholder ?? options[0]?.label}
          <span className={selectCaret({ open })}>{open ? '▴' : '▾'}</span>
        </button>
      )}
    >
      {({ close }) =>
        options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(o.value)
                close()
              }}
              className={selectOption({ selected })}
            >
              {o.label}
            </button>
          )
        })
      }
    </Popover>
  )
}
