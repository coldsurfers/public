'use client'
import { ArticleCard } from '@coldsurfers/design-system/cards'

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
      <ArticleCard
        tone="forest"
        category="TAPE"
        title="여름의 리버브"
        excerpt="테이프 딜레이가 남긴 잔향만 모아 들었다."
        meta="7.15 · 24분"
      />
      <ArticleCard
        tone="plum"
        category="MIND"
        title="공연장에서 혼자 서 있기"
        excerpt="같이 갈 사람이 없어서 못 간 공연 목록."
        meta="7.11"
      />
    </div>
  )
}
