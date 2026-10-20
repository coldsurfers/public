'use client'
import { Masonry, PinCard, pinCardHeight } from '@coldsurfers/surf-ui/cards'
import { Button } from '@coldsurfers/surf-ui/primitives'
import { useState } from 'react'
import { type SamplePin, samplePins } from './pin-samples'

/** 다음 쪽 흉내 — 같은 핀을 새 키로 한 쪽 더. */
const pageOf = (page: number): SamplePin[] =>
  samplePins.map((pin) => ({ ...pin, id: `${pin.id}-${page}` }))

export default function Example() {
  const [pages, setPages] = useState(1)
  const items = Array.from({ length: pages }, (_, page) => pageOf(page)).flat()
  return (
    <div style={{ width: 360, display: 'grid', gap: 16 }}>
      <Masonry
        items={items}
        keyOf={(pin) => pin.id}
        heightOf={(pin) => pinCardHeight(pin.ratio ?? undefined, !!pin.meta)}
        renderItem={(pin) => (
          <PinCard poster={pin.poster ?? undefined} meta={pin.meta} fallback={pin.title}>
            <a href={`#${pin.id}`}>{pin.title}</a>
          </PinCard>
        )}
      />
      <Button variant="outline" onClick={() => setPages((n) => n + 1)}>
        다음 쪽 붙이기
      </Button>
    </div>
  )
}
