'use client'
import { Button } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <>
      <Button size="cta" variant="accent" shape="pill">
        내 동네로 정하기
      </Button>
      <Button size="cta" variant="outline" shape="pill" leadingIcon="✓">
        내 동네
      </Button>
      <Button size="cta" variant="accent" disabled>
        잠김
      </Button>
    </>
  )
}
