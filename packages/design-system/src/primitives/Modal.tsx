import type { ReactNode, RefObject } from 'react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'
import { modalBody, modalOverlay, modalPanel } from './Modal.css'
import { useDialogBehavior } from './useDialogBehavior'

/**
 * 백드롭 + 패널 꼴의 다이얼로그. 행동은 `useDialogBehavior` 가, 마크업만 여기가 든다.
 *
 * 오버레이가 `role="dialog"` 를 들고, 오버레이 클릭은 `dismissible` 일 때만 닫는다
 * (패널 클릭은 `stopPropagation`).
 *
 * ⚠️ **`document.body` 로 portal 한다.** `fixed inset-0` 은 overflow 클리핑만 면해줄 뿐,
 * `position: sticky`·`transform`·`filter` 를 가진 조상이 있으면 그 조상이 stacking context 를
 * 만들어 오버레이의 `z-index` 가 페이지가 아니라 *조상 안* 에서만 유효해진다. 실제로 `/daily`
 * 의 공연장 레일(sticky)에서 같은 묶음의 티켓들이 모달 위로 올라왔다. portal 은 소비처가
 * 어디에 놓이든 이 함정을 없앤다 — `Popover`·`ImageLightbox` 와 같은 자리.
 *
 * 대신 warm-paper 서브트리가 인라인으로 주입하는 표면 오버라이드는 **못 받는다**. 팔레트는
 * 문제없다 — 스킴이 paper 하나뿐이라(#298) `:root` 가 곧 light 다. 서브트리가 얹는 건
 * `--bg: paper.warm` 같은 표면 차이뿐이므로, 그 바닥색이 필요하면 소비처가 직접 준다.
 *
 * 전면 시트처럼 백드롭/패널 구조가 아닌 표면은 이 컴포넌트 대신 훅만 쓴다.
 */
export interface ModalProps {
  open: boolean
  onClose: () => void
  /** 다이얼로그 `aria-label`. */
  label: string
  /** false 면 Escape·백드롭 클릭을 무시한다(처리 중 잠금). 기본 true. */
  dismissible?: boolean
  /** 닫힌 뒤 포커스를 되돌릴 트리거. */
  triggerRef?: RefObject<HTMLElement | null>
  /** 오버레이 추가 클래스 — 정렬(`items-center`)·배경(`bg-black/50`). */
  overlayClassName?: string
  /** 패널 추가 클래스 — 폭(`max-w-sm`)·여백. */
  panelClassName?: string
  children: ReactNode
}

export function Modal({
  open,
  onClose,
  label,
  dismissible = true,
  triggerRef,
  overlayClassName,
  panelClassName,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogBehavior({ open, onClose, ref: dialogRef, triggerRef, dismissible })

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: 백드롭 클릭 닫기의 키보드 등가물은 훅의 Escape 다.
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={cx(modalOverlay, overlayClassName)}
      onClick={() => {
        if (dismissible) onClose()
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: 패널 클릭이 백드롭까지 올라가 닫히지 않게 막는 것뿐, 액션이 아니다. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 위와 동일 — 키보드 경로에선 버블링 자체가 없다. */}
      <div className={cx(modalPanel, panelClassName)} onClick={(e) => e.stopPropagation()}>
        <div className={modalBody}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
