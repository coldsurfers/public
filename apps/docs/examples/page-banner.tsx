'use client'
import { PageBanner } from '@coldsurfers/design-system/layout'
import { Button } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ width: '100%' }}>
      <PageBanner>
        {/* 밴드 안의 배치는 소비처가 정한다 — DS 가 드는 건 바닥 · 셸 · 타이포뿐이다. */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <PageBanner.Title>새 공연 뜨면 알려드릴게요</PageBanner.Title>
            <PageBanner.Body>스팸 없이.</PageBanner.Body>
          </div>
          <Button>알림 받기</Button>
        </div>
      </PageBanner>
    </div>
  )
}
