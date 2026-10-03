'use client'
import { PickCard, PickRow } from '@coldsurfers/surf-ui/cards'
import { RowAction } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  const card = (
    <PickCard
      title="오늘 저녁"
      kicker="TODAY · 10.01"
      footer={<a href="#pick-card">18건 모두 ›</a>}
      style={{ width: '100%', maxWidth: 420 }}
    >
      <PickRow
        time="19:30"
        title="까치산 단독공연"
        meta="웨스트브릿지"
        action={<RowAction>예매 ↗</RowAction>}
      />
      <PickRow
        time="20:00"
        title="인디 쇼케이스 「가을 밤」"
        meta="클럽 FF"
        action={<RowAction>예매 ↗</RowAction>}
      />
    </PickCard>
  )

  return (
    <>
      {card}
      <div
        data-surface="ink"
        style={{ padding: 16, borderRadius: 24, background: 'var(--surf-bg-base)' }}
      >
        {card}
      </div>
    </>
  )
}
