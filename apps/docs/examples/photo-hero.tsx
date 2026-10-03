'use client'
import { PhotoHero, PickCard, PickRow } from '@coldsurfers/surf-ui/cards'
import { Button, CornerLabel, RowAction } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <PhotoHero
      style={{ width: '100%' }}
      topLabel={<CornerLabel>{'MUSIC\nPEOPLE\nPLACES'}</CornerLabel>}
      wordmark="COLDSURF"
      copy={'좋은 음악이\n있는 곳으로, 언제든.'}
      subcopy={'MUSIC BRINGS PEOPLE TO\nA BRIGHTER PLACE.'}
      bottomLabel={<CornerLabel>{'DISCOVER\nYOUR NEXT SCENE'}</CornerLabel>}
      aside={
        <>
          <h2
            style={{ margin: 0, fontSize: 'var(--surf-layout-type-hero-title)', fontWeight: 900 }}
          >
            오늘 밤 서울
          </h2>
          <PickCard title="오늘 밤 고르기" footer="18개 모두 ›">
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
          <Button variant="accent" shape="pill">
            🔔 오늘 밤 알림 받기
          </Button>
        </>
      }
    />
  )
}
