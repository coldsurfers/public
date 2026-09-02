'use client'
import { Button, EmptyState } from '@coldsurfers/design-system/primitives'
import { sprinkles } from '@coldsurfers/design-system/sprinkles'

export default function Example() {
  return (
    <EmptyState className={sprinkles({ paddingY: '12' })}>
      <p className={sprinkles({ fontSize: 'xl', color: 'strong' })}>오늘 밤은 조용하네요.</p>
      <p className={sprinkles({ fontSize: 'base', color: 'muted' })}>
        오늘 저녁 공연이 아직 없어요.
      </p>
      <Button variant="accent" size="cta">
        이번 주말 보기
      </Button>
    </EmptyState>
  )
}
