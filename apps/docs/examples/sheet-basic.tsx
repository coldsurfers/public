'use client'
import { MediaRow } from '@coldsurfers/surf-ui/cards'
import { Button, KeyValueRow, Sheet } from '@coldsurfers/surf-ui/primitives'
import { useRef, useState } from 'react'

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
      >
        <div>
          <KeyValueRow label="VIP석" value="189,000원" />
          <KeyValueRow label="R석" value="164,000원" />
        </div>
        <Button variant="accent" onClick={() => setOpen(false)}>
          놀유니버스에서 예매 ↗
        </Button>
      </Sheet>
    </>
  )
}
