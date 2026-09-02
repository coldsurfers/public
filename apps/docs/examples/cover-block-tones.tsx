'use client'
import { Badge, CoverBlock } from '@coldsurfers/design-system/primitives'
import { COVER_TONES } from '@coldsurfers/design-system/tokens'

export default function Example() {
  return (
    <>
      {COVER_TONES.map((tone) => (
        <CoverBlock
          key={tone}
          tone={tone}
          style={{ width: 120, height: 120, display: 'grid', placeItems: 'center' }}
        >
          <Badge>{tone}</Badge>
        </CoverBlock>
      ))}
    </>
  )
}
