'use client'
import { Button } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="cta" variant="accent">
        cta
      </Button>
      <Button variant="ghost" trailingIcon="→">
        읽기
      </Button>
    </>
  )
}
