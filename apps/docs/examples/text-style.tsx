'use client'
import { text } from '@coldsurfers/design-system'
import { sprinkles } from '@coldsurfers/design-system/sprinkles'

export default function Example() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <h2 className={text('heading', { weight: 'semibold' })}>이번 주말, 홍대</h2>
      <h3 className={text('title', { weight: 'medium' })}>금요일 밤의 라인업</h3>

      <p className={text('body')}>
        크기 하나가 아니라 역할 하나를 고릅니다. 행간과 자간이 그 역할에 맞게 같이 따라오므로, 같은
        자리에 선 글자는 지면이 달라도 같은 리듬으로 읽힙니다.
      </p>

      {/* 램프는 색을 묶지 않는다 — 같은 역할이 표면에 따라 다른 색을 입는 건 정상이다. */}
      <p className={`${text('bodySm')} ${sprinkles({ color: 'muted' })}`}>
        보조 문장은 한 단 아래에서 같은 규칙을 따릅니다.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span className={text('label', { weight: 'medium' })}>라벨</span>
        <span className={`${text('labelSm')} ${sprinkles({ color: 'muted' })}`}>21:00 입장</span>
        <span className={`${text('micro')} ${sprinkles({ color: 'subtle' })}`}>ISSUE 07</span>
      </div>
    </div>
  )
}
