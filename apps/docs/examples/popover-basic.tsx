'use client'
import { Chip, POPOVER_MENU_CLS, Popover } from '@coldsurfers/design-system/primitives'

const LINKS = ['TAPE', 'MIND', 'DEV']

export default function Example() {
  return (
    <Popover
      role="menu"
      menuClassName={POPOVER_MENU_CLS}
      trigger={({ open, toggle }) => (
        <Chip active={open} onClick={toggle}>
          카테고리 ▾
        </Chip>
      )}
    >
      {({ close }) =>
        LINKS.map((label) => (
          <button
            key={label}
            type="button"
            role="menuitem"
            onClick={close}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 14px',
              border: 0,
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))
      }
    </Popover>
  )
}
