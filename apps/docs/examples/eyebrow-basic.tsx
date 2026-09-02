'use client'
import { Eyebrow } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Eyebrow size="md" tone="accent">
        This week&rsquo;s pick
      </Eyebrow>
      <Eyebrow size="sm">Live · 이번 주 홍대</Eyebrow>
      <Eyebrow size="xs" tone="subtle">
        Issue 07
      </Eyebrow>
    </div>
  )
}
