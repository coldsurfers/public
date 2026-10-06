'use client'
import { MediaRow } from '@coldsurfers/surf-ui/cards'
import { Button, KeyValueRow, Sheet } from '@coldsurfers/surf-ui/primitives'
import { useRef, useState } from 'react'

const TIERS = [
  ['VIP석', '189,000원'],
  ['R석', '164,000원'],
  ['S석', '134,000원'],
  ['A석', '104,000원'],
  ['B석', '79,000원'],
  ['시야제한석', '59,000원'],
]

export default function Example() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        시트 열기
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        label="인터스텔라 필름콘서트 고르기"
        triggerRef={triggerRef}
        head={
          <MediaRow
            cover="인"
            kicker="일 10.11 · 14:00"
            title="인터스텔라 필름콘서트"
            meta="경희대 평화의전당"
          />
        }
        footer={
          <Button variant="accent" onClick={() => setOpen(false)}>
            놀유니버스에서 예매 ↗
          </Button>
        }
      >
        <div>
          {TIERS.map(([label, value]) => (
            <KeyValueRow key={label} label={label} value={value} />
          ))}
        </div>
      </Sheet>
    </>
  )
}
