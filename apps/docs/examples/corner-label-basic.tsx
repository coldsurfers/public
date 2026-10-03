'use client'
import { CornerLabel } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <CornerLabel>{'THIS WEEK\nIN SEOUL'}</CornerLabel>
      <div
        data-surface="ink"
        style={{ padding: 24, borderRadius: 16, background: 'var(--surf-bg-base)' }}
      >
        <CornerLabel>{'BROWSE BY\nGENRE · REGION'}</CornerLabel>
      </div>
    </>
  )
}
