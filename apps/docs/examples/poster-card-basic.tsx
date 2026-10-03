'use client'
import { PosterCard } from '@coldsurfers/surf-ui/primitives'

export default function Example() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 160px)', gap: 16 }}>
      <PosterCard title="브로콜리너마저 단독" meta="SAT 10.03 · 무신사 개러지" />
      <PosterCard title="실내악 리사이틀" meta="SUN 10.04 · 서초" />
      <PosterCard title="NOL FESTIVAL: DAY 1" meta="SAT 09.27 · 난지" past />
    </div>
  )
}
