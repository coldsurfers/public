'use client'
import { ThinkingDots } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'var(--surf-surface-raised)',
      }}
    >
      취향을 고르는 중 <ThinkingDots />
    </span>
  )
}
