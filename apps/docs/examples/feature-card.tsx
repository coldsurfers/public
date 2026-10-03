'use client'
import { FeatureCard } from '@coldsurfers/surf-ui/cards'
import { RowAction } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <FeatureCard
      title="놓치지 않게"
      description="좋아하는 공연장 · 팀의 새 공연을 먼저"
      action={<RowAction>알림 켜기</RowAction>}
      style={{ width: '100%', maxWidth: 420 }}
    />
  )
}
