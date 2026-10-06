'use client'
import { LinkBand } from '@coldsurfers/surf-ui/cards'

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 360 }}>
      <LinkBand asChild kicker="CHOICE #031 에 실림" action="판 보기 ›">
        <a href="#link-band">이번 주말 7개 중 하나</a>
      </LinkBand>
      <LinkBand asChild lead="#031">
        <a href="#link-band">이 중 3개가 이번 주말 판에</a>
      </LinkBand>
    </div>
  )
}
