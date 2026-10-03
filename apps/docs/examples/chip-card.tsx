'use client'
import { ChipCard, ChipCardItem } from '@coldsurfers/surf-ui/cards'

const REGIONS = [
  ['서울', 1204],
  ['경기', 388],
  ['부산', 212],
  ['인천', 96],
  ['대구', 88],
] as const

export default function Example() {
  return (
    <ChipCard title="지역으로 고르기" style={{ width: '100%', maxWidth: 440 }}>
      {REGIONS.map(([label, count]) => (
        <ChipCardItem key={label} asChild label={label} count={count}>
          <a href={`#${label}`}>{label}</a>
        </ChipCardItem>
      ))}
    </ChipCard>
  )
}
