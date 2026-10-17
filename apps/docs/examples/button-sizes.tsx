'use client'
import { Button } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="cta" variant="accent">
        cta
      </Button>
      <Button size="lg" variant="accent">
        lg
      </Button>
      <Button variant="ghost" trailingIcon="→">
        읽기
      </Button>
    </>
  )
}
