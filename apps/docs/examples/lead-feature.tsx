'use client'
import { LeadFeature } from '@coldsurfers/design-system/cards'

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <LeadFeature
        tone="moss"
        eyebrow="THIS WEEK'S PICK"
        title="한여름의 소극장 투어"
        excerpt="에어컨이 약한 공연장 다섯 곳을 골랐다. 그래도 갔다."
        byline="tomwaters · 7월 3주"
        cta="읽기 →"
      />
    </div>
  )
}
