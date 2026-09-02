'use client'
import { ConcertCard } from '@coldsurfers/design-system/cards'
import { Button } from '@coldsurfers/design-system/primitives'

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
      <ConcertCard
        tone="forest"
        initial="ㅅ"
        matchLabel="96% 취향"
        title="Silica Gel"
        meta="롤링홀 · 서울 · 7.24 금"
        footer={
          <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>좋아한 아티스트와 같은 결</p>
        }
        coverAction={<Button size="sm">담기</Button>}
      />
      <ConcertCard
        variant="bare"
        tone="wine"
        initial="ㅁ"
        title="Mid-Air Thief"
        meta="7.26 일"
        footer={<p style={{ margin: 0, color: 'var(--muted)' }}>무신사 개러지</p>}
        reserveTitleLines
      />
      <ConcertCard
        variant="cover"
        tone="navy"
        initial="ㅍ"
        eyebrow="INDIE ROCK"
        title="Parannoul"
        meta="7.30 수 · 무신사 개러지"
      />
    </div>
  )
}
