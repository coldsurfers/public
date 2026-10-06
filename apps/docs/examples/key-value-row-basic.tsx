'use client'
import { KeyValueRow } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <KeyValueRow label="VIP석" value="189,000원" />
      <KeyValueRow label="R석" value="164,000원" />
      <KeyValueRow label="S석" value="139,000원" />
      <KeyValueRow label="A석" value="69,000원" />
    </div>
  )
}
