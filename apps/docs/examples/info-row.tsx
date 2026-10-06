'use client'
import { InfoRow } from '@coldsurfers/surf-ui/cards'

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <InfoRow asChild thumb="평" meta="동대문구 · 다가오는 5">
        <a href="#info-row">경희대학교 평화의전당</a>
      </InfoRow>
    </div>
  )
}
