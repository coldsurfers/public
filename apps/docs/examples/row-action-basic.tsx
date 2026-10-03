'use client'
import { RowAction } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <RowAction>예매 ↗</RowAction>
      <RowAction>알림</RowAction>
      <RowAction asChild>
        <a href="#row-action">보기</a>
      </RowAction>
    </>
  )
}
