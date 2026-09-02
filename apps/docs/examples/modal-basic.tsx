'use client'
import { Button, Modal } from '@coldsurfers/design-system/primitives'
import { useRef, useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        모달 열기
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="예매를 취소할까요?"
        triggerRef={triggerRef}
        panelClassName="preview-modal-panel"
      >
        <p style={{ margin: 0, fontWeight: 500 }}>예매를 취소할까요?</p>
        <p style={{ margin: '8px 0 16px', color: 'var(--muted)' }}>
          취소한 자리는 바로 다른 사람에게 넘어갑니다.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            돌아가기
          </Button>
          <Button variant="accent" onClick={() => setOpen(false)}>
            취소하기
          </Button>
        </div>
      </Modal>
    </>
  )
}
