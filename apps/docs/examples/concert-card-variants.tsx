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
      <ConcertCard.Framed
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
      <ConcertCard.Bare
        tone="wine"
        initial="ㅁ"
        title="Mid-Air Thief"
        meta="7.26 일"
        footer={<p style={{ margin: 0, color: 'var(--muted)' }}>무신사 개러지</p>}
        reserveTitleLines
      />
      {/* `initial` 이 없다 — 이 섀시는 포스터가 없으면 tone 색면만 남긴다. 평평한
          `ConcertCardProps` 에서는 필수라 안 그려질 자모를 지어내야 했다. */}
      <ConcertCard.Cover
        tone="navy"
        eyebrow="INDIE ROCK"
        title="Parannoul"
        meta="7.30 수 · 무신사 개러지"
      />
      <ConcertCard.Cover
        size="compact"
        tone="plum"
        title="Oohyo"
        meta="8.02 토"
        footer="예스24 라이브홀"
        coverAction={<Button size="sm">담기</Button>}
      />
    </div>
  )
}
