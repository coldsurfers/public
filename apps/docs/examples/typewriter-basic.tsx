'use client'
import { Button, TypewriterText } from '@coldsurfers/design-system/primitives'
import { useState } from 'react'

export default function Example() {
  const [take, setTake] = useState(0)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 18 }}>
        <TypewriterText key={take} text="당신의 이번 주는 슈게이즈였습니다." />
      </p>
      <Button variant="ghost" onClick={() => setTake((n) => n + 1)}>
        다시 재생
      </Button>
    </div>
  )
}
