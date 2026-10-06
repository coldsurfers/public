import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'
import type { ModalProps } from './Modal'
import { modalOverlay, modalPanel, modalPlacement } from './Modal.css'
import * as s from './Sheet.css'
import { useSurfaceMode } from './surface-mode'
import { useDialogBehavior } from './useDialogBehavior'
import { prefersReducedMotion, useDragToClose } from './useDragToClose'

/**
 * 아래 시트 — Figma `1028:381`. 모바일은 화면 아래에 붙고, 데스크탑(≥1024)은 가운데 모달(최대 560)이 된다.
 *
 * 세 칸이다 — 머리(손잡이 + `head`, 고정) → 내용(`children`, 길면 여기만 구른다) → 아래(`footer`, 고정).
 * 모바일은 머리를 잡고 끌어내려 닫는다. 열고 닫을 때 올라오고 내려간다 — `open` 이 false 가 돼도
 * 퇴장이 끝날 때까지 마지막 내용을 그린 채로 둔다. 움직임 줄이기 설정에선 애니메이션 없이 바로.
 *
 * 행동(Escape · 스크롤 잠금 · focus trap)은 `useDialogBehavior`, 자리는 `Modal` 의 `sheet` placement 를 쓴다.
 * 퇴장 동안 패널을 남겨야 해서 `Modal` 을 감싸지 않고 마크업을 직접 든다.
 */
export interface SheetProps
  extends Omit<ModalProps, 'placement' | 'panelClassName' | 'overlayClassName'> {
  /** 머리 — 「무엇을 고른 건지」. 보통 `MediaRow`. 고정이고, 모바일에선 잡고 끌어내리는 자리다. */
  head?: ReactNode
  /** 아래 — 늘 보이는 주 행동(반응 줄 · 예매 버튼). 고정. */
  footer?: ReactNode
  /** 패널 추가 클래스. */
  className?: string
}

export function Sheet({
  open,
  onClose,
  label,
  dismissible = true,
  triggerRef,
  head,
  footer,
  className,
  children,
}: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const mode = useSurfaceMode()
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const thrown = useRef(false)
  // 닫히는 동안 그릴 내용 — 소비처가 `open` 과 함께 내용을 비워도 퇴장 내내 남는다.
  const last = useRef({ head, footer, children })
  if (open) last.current = { head, footer, children }

  useDialogBehavior({ open, onClose, ref: dialogRef, triggerRef, dismissible })

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    // 끌어서 이미 화면 밖이면 퇴장을 또 그리지 않는다.
    if (thrown.current || prefersReducedMotion()) {
      thrown.current = false
      setRendered(false)
      return
    }
    setClosing(true)
    const timer = window.setTimeout(() => {
      setRendered(false)
      setClosing(false)
    }, s.EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  const drag = useDragToClose(panelRef, () => {
    thrown.current = true
    onClose()
  })

  if (!rendered || typeof document === 'undefined') return null
  const shown = last.current

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: 백드롭 클릭 닫기의 키보드 등가물은 훅의 Escape 다.
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-surface={mode}
      className={cx(modalOverlay, modalPlacement.sheet, s.overlay, closing && s.overlayClosing)}
      onClick={() => {
        if (dismissible && open) onClose()
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 패널 클릭이 백드롭까지 올라가 닫히지 않게 막는 것뿐, 액션이 아니다. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 위와 동일 — 키보드 경로에선 버블링 자체가 없다. */}
      <div
        ref={panelRef}
        className={cx(modalPanel, s.panel, closing && s.panelClosing, className)}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={cx(s.head, !shown.head && s.headBare)} {...drag}>
          <span className={s.handle} aria-hidden />
          {shown.head}
        </header>
        <div className={s.content}>{shown.children}</div>
        {shown.footer ? <footer className={s.footer}>{shown.footer}</footer> : null}
      </div>
    </div>,
    document.body,
  )
}
