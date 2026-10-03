'use client'
import { Spinner } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <Spinner />
      <Spinner size={20} />
      <Spinner label="공연을 더 불러오는 중" />
    </>
  )
}
