'use client'
import { PinCard } from '@coldsurfers/surf-ui/cards'
import { IconButton } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ columnCount: 2, columnGap: 12, orphans: 1, widows: 1, width: 360 }}>
      <PinCard
        meta="ticketlink.co.kr"
        fallback="MOBO 인디 뮤직 페스티벌"
        action={
          <IconButton label="담기" variant="secondary" shape="pill" size="sm">
            ＋
          </IconButton>
        }
      >
        <a href="#pin">MOBO 인디 뮤직 페스티벌</a>
      </PinCard>
      <PinCard meta="성수동" fallback="팝업">
        제목만 있는 핀
      </PinCard>
    </div>
  )
}
