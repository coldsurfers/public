'use client'
import { Note } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <>
      <Note meta="9월 20일 19:00">언니네 이발관 단독공연</Note>
      <Note meta="어제 저장함" tone="muted">
        Slowdive 첫 내한
      </Note>
      <Note>메타 없이 한 줄만</Note>
    </>
  )
}
