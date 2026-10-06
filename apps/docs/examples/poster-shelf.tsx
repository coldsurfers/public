'use client'
import { PosterShelf, PosterShelfItem } from '@coldsurfers/surf-ui/cards'

const SAME_BOARD = [
  { id: 'arthouse', title: '아트하우스 17', meta: '토 17:00', cover: '아' },
  { id: 'vos', title: 'V.O.S 콘서트', meta: '일 17:00', cover: 'V' },
  { id: 'charlie', title: '찰리 푸스', meta: '일 19:00', cover: '찰' },
  { id: 'mobo', title: '모보 페스티벌', meta: '토 12:00', cover: '모' },
]

export default function Example() {
  return (
    <PosterShelf kicker="SAME BOARD · #031" style={{ width: '100%', maxWidth: 360 }}>
      {SAME_BOARD.map((item) => (
        <PosterShelfItem key={item.id} asChild meta={item.meta} cover={item.cover}>
          <a href="#poster-shelf">{item.title}</a>
        </PosterShelfItem>
      ))}
    </PosterShelf>
  )
}
