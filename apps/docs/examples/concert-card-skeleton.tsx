'use client'
import { ConcertCard, ConcertCardSkeleton } from '@coldsurfers/design-system/cards'

export default function Example() {
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gap: 20,
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      }}
    >
      <ConcertCardSkeleton tone="steel" />
      <ConcertCard
        tone="steel"
        initial="ㅎ"
        title="HYUKOH"
        meta="예스24 라이브홀 · 서울 · 8.2 토"
      />
    </div>
  )
}
