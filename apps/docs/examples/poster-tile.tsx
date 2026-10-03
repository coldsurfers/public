'use client'
import { PosterTile } from '@coldsurfers/surf-ui/cards'
import { RowAction } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <PosterTile
        title="아이랑 갈 만한 공연"
        meta={
          <>
            <span>10.03–04</span>
            <span>12편</span>
          </>
        }
        action={<RowAction>보기</RowAction>}
      />
    </div>
  )
}
