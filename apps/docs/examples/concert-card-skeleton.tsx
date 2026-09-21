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
      {/* 문 이름이 짝이다 — 스켈레톤과 실카드를 같은 이름으로 부르면 치수가 어긋날 자리가 없다. */}
      <ConcertCardSkeleton.Framed tone="steel" />
      <ConcertCard.Framed
        tone="steel"
        initial="ㅎ"
        title="HYUKOH"
        meta="예스24 라이브홀 · 8.2 토"
      />
      <ConcertCardSkeleton.CoverCompact tone="plum" />
      <ConcertCard.CoverCompact tone="plum" title="Oohyo" meta="8.02 토" footer="예스24 라이브홀" />
    </div>
  )
}
