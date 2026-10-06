'use client'
import { PosterThumb } from '@coldsurfers/surf-ui/cards'
import { StatPill } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 120px)', gap: 10 }}>
      <PosterThumb cover="M" badge={<StatPill icon="🔥" value="31" tone="hot" />} />
      <PosterThumb cover="P" badge={<StatPill icon="🔥" value="12" tone="hot" />} />
      <PosterThumb cover="찰" />
    </div>
  )
}
