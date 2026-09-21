'use client'
import { ConcertCard } from '@coldsurfers/design-system/cards'
import { Button } from '@coldsurfers/design-system/primitives'
import { sprinkles } from '@coldsurfers/design-system/sprinkles'

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
        initial="ㅅ"
        matchLabel="96% 취향"
        title="Silica Gel"
        meta="롤링홀 · 서울 · 7.24 금"
        footer={
          // `footer` 는 슬롯이라 서식을 소비처가 준다 — 그 서식은 `sprinkles` 에서 온다.
          // 색을 `var(--muted)` 로 손으로 박으면 토큰이 바뀌는 날 이 자리가 안 따라온다.
          <p className={sprinkles({ margin: '0', marginTop: '1', color: 'muted' })}>
            좋아한 아티스트와 같은 결
          </p>
        }
        coverAction={<Button size="sm">담기</Button>}
      />
      <ConcertCard.Bare
        initial="ㅁ"
        title="Mid-Air Thief"
        meta="7.26 일"
        footer={<p className={sprinkles({ margin: '0', color: 'muted' })}>무신사 개러지</p>}
        reserveTitleLines
      />
      {/* `initial` 도 `footer` 도 없다 — 이 섀시는 포스터가 없으면 note 면만 남기고,
          공연장 줄을 아무 데도 안 그린다. 평평한 `ConcertCardProps` 에서는 둘 다 통과했다. */}
      <ConcertCard.Cover eyebrow="INDIE ROCK" title="Parannoul" meta="7.30 수 · 무신사 개러지" />
      {/* 작은 칸은 문이 다르다. `size` 플래그가 아니라 문 이름이 크기를 말하고,
          `footer` 는 이쪽에만 있다. */}
      <ConcertCard.CoverCompact
        title="Oohyo"
        meta="8.02 토"
        footer="예스24 라이브홀"
        coverAction={<Button size="sm">담기</Button>}
      />
      {/* 위와 같은 그림, 더 큰 칸. 여러 열 그리드처럼 칸이 넓은 자리에서 세로 포스터가 덜 잘린다. */}
      <ConcertCard.CoverLarge
        title="Jambinai"
        meta="8.09 토"
        footer="무신사 개러지"
        coverAction={<Button size="sm">담기</Button>}
      />
    </div>
  )
}
