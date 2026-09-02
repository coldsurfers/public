'use client'
import { Checkbox } from '@coldsurfers/design-system/primitives'
import { useState } from 'react'

export default function Example() {
  const [agreed, setAgreed] = useState(true)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
        이용약관에 동의합니다
      </Checkbox>
      <Checkbox disabled>마케팅 수신 (비활성)</Checkbox>
    </div>
  )
}
