'use client'
import { StatPill } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <StatPill icon="👁" value="1,204" />
      <StatPill icon="🔥" value="31" tone="hot" />
      <StatPill value="목 18:00 배달" />
    </>
  )
}
