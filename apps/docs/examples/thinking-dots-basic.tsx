'use client'
import { ThinkingDots } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'var(--surface)',
      }}
    >
      취향을 고르는 중 <ThinkingDots />
    </span>
  )
}
