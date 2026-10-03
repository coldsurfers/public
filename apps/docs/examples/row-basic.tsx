'use client'
import { Row, RowDate, RowTime } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <Row lead={<RowTime>19:30</RowTime>} title="까치산 단독공연" sub="웨스트브릿지" />
      <Row lead={<RowDate dow="SAT" day="03" />} title="한로로 「집」 투어" sub="18:00 · 홀링홀" />
      <Row
        lead={<RowTime>20:00</RowTime>}
        title="오케스트라 정기공연"
        sub="예술의전당"
        past
        trail="종료"
      />
    </div>
  )
}
