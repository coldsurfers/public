'use client'
import { Eyebrow, Ticket } from '@coldsurfers/design-system/primitives'

export default function Example() {
  return (
    <Ticket
      orientation="row"
      style={{ maxWidth: 420 }}
      stub={
        <div style={{ textAlign: 'center' }}>
          <Eyebrow size="xs">Admit</Eyebrow>
          <p style={{ margin: '4px 0 0', fontWeight: 600 }}>01</p>
        </div>
      }
      stubClassName="preview-ticket-stub"
    >
      <div style={{ padding: 20 }}>
        <Eyebrow size="sm">Live · 홍대 상상마당</Eyebrow>
        <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 600 }}>Silica Gel</p>
        <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>2026.10.04 (일) 19:00</p>
      </div>
    </Ticket>
  )
}
