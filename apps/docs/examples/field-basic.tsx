'use client'
import { Field } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      <Field placeholder="아티스트나 장르 하나…" trailing="↵" />
      <Field placeholder="비활성" disabled />
    </div>
  )
}
