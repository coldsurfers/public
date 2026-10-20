'use client'
import { Masonry, PinCard, pinCardHeight } from '@coldsurfers/surf-ui/cards'
import { samplePins } from './pin-samples'

export default function Example() {
  return (
    <div style={{ width: 360 }}>
      <Masonry
        items={samplePins}
        keyOf={(pin) => pin.id}
        heightOf={(pin) => pinCardHeight(pin.ratio ?? undefined, !!pin.meta)}
        renderItem={(pin) => (
          <PinCard poster={pin.poster ?? undefined} meta={pin.meta} fallback={pin.title}>
            <a href={`#${pin.id}`}>{pin.title}</a>
          </PinCard>
        )}
      />
    </div>
  )
}
