'use client'
import { Page } from '@coldsurfers/design-system/layout'

export default function Example() {
  return (
    // 실제 표면에선 min-height 가 100vh 다 — 미리보기라 style 로 낮춘다.
    <Page
      surface="docs"
      style={{ minHeight: 220, width: '100%', border: '1px dashed var(--border)' }}
    >
      <div style={{ padding: 12, borderBottom: '1px dashed var(--border)' }}>SiteHeader</div>
      <Page.Content style={{ padding: 12 }}>본문 — 남은 높이를 전부 먹는다</Page.Content>
      <div style={{ padding: 12, borderTop: '1px dashed var(--border)' }}>SiteFooter</div>
    </Page>
  )
}
