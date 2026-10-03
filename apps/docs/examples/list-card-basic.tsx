'use client'
import { ListCard, Row, RowTime } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <ListCard footer="18편 모두 ›" style={{ width: '100%', maxWidth: 480 }}>
      <Row lead={<RowTime>19:30</RowTime>} title="까치산 단독공연" sub="웨스트브릿지" />
      <Row lead={<RowTime>20:00</RowTime>} title="인디 쇼케이스 「가을 밤」" sub="클럽 FF" />
      <Row lead={<RowTime>20:00</RowTime>} title="오케스트라 정기공연" sub="예술의전당" />
    </ListCard>
  )
}
