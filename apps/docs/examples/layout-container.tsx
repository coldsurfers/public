'use client'
import { Container } from '@coldsurfers/design-system/layout'

export default function Example() {
  return (
    <div style={{ width: '100%', background: 'var(--surface-2)' }}>
      <Container as="header" style={{ paddingBlock: 12, borderBottom: '1px dashed var(--border)' }}>
        COLDSURF
      </Container>
      <Container as="main" style={{ paddingBlock: 12 }}>
        헤더 로고와 본문이 같은 세로선에 선다 — 지면 배경은 그 선 밖까지 간다
      </Container>
    </div>
  )
}
