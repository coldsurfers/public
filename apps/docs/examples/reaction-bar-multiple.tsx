'use client'
import { ReactionBar } from '@coldsurfers/surf-ui/primitives'
import { useState } from 'react'

const BASE = [
  { id: 'go', label: '🔥 갈래', count: 22 },
  { id: 'hmm', label: '🤔 고민', count: 9 },
  { id: 'pricey', label: '💸 비싸', count: 4 },
]

export default function Example() {
  const [mine, setMine] = useState<string[]>(['go', 'pricey'])
  const items = BASE.map((r) => ({ ...r, count: r.count + (mine.includes(r.id) ? 1 : 0) }))

  return (
    <ReactionBar
      multiple
      aria-label="이 공연 어때요"
      items={items}
      value={mine}
      onChange={(id, on) => setMine((prev) => (on ? [...prev, id] : prev.filter((k) => k !== id)))}
      style={{ width: '100%', maxWidth: 360 }}
    />
  )
}
