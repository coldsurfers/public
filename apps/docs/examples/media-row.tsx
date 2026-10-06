'use client'
import { MediaRow } from '@coldsurfers/surf-ui/cards'
import { Badge, StatPill } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div
      data-surface="ink"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        maxWidth: 390,
        padding: 20,
        borderRadius: 24,
        background: 'var(--surf-bg-base)',
      }}
    >
      <MediaRow
        cover="모"
        kicker="토 10.10 · 12:00"
        title="모보 페스티벌"
        meta="파주 · 아시아출판문화정보센터"
        footer={
          <>
            <strong>88,000원</strong>
            <Badge variant="soft">2TM</Badge>
          </>
        }
        aside={
          <>
            <StatPill icon="🔥" value="31" tone="hot" />
            <StatPill icon="👁" value="80" />
          </>
        }
      />
      <MediaRow
        selected
        cover="인"
        kicker="일 10.11 · 14:00"
        title="인터스텔라 필름콘서트"
        meta="경희대 평화의전당"
        aside={<StatPill icon="👁" value="17" />}
      />
      <MediaRow
        dimmed
        cover="V"
        kicker="일 10.11 · 17:00"
        title="V.O.S 콘서트"
        meta="용인포은아트홀"
      />
    </div>
  )
}
