'use client'
import { ReactionBar } from '@coldsurfers/surf-ui/primitives'
import { useState } from 'react'

const BASE = [
  { id: 'go', label: '🔥 갈래', count: 22 },
  { id: 'hmm', label: '🤔 고민', count: 9 },
  { id: 'pricey', label: '💸 비싸', count: 4 },
]

export default function Example() {
  const [mine, setMine] = useState<string | null>('go')
  const items = BASE.map((r) => ({ ...r, count: r.count + (r.id === mine ? 1 : 0) }))

  return (
    <ReactionBar
      aria-label="이 공연 어때요"
      items={items}
      value={mine}
      onChange={setMine}
      style={{ width: '100%', maxWidth: 360 }}
    />
  )
}
