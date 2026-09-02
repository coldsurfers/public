'use client'
import { Skeleton } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <Skeleton width={96} aspectRatio="3 / 4" radius="lg" />
      <div style={{ display: 'grid', gap: 8, flex: 1, maxWidth: 260 }}>
        <Skeleton width="60%" height="1rem" />
        <Skeleton width="90%" height="0.75rem" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
    </div>
  )
}
