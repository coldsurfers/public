import { type RefObject, useEffect, useRef } from 'react'

/**
 * 다이얼로그가 열려 있는 동안의 공통 *행동* — Escape 닫기 · body 스크롤 잠금 ·
 * focus trap · 닫힐 때 트리거로 포커스 복귀.
 *
 * 마크업은 담당하지 않는다. 백드롭+패널 꼴이면 `Modal` 을 쓰고, 전면 시트처럼 구조가
 * 다른 표면(`GlobalHeader` 의 AnimatePresence 네비)은 자기 마크업에 이 훅만 얹는다.
 *
 * 원본은 `GlobalHeader` 의 인라인 구현 — `aria-modal` 다이얼로그 8곳 중 유일하게 focus trap 과
 * 포커스 복귀까지 갖춘 곳이라, 신설이 아니라 거기서 추출했다.
 * 상세: `specs/packages-ui/modal-primitive.md`.
 */

/**
 * Tab 순환 대상. 원본(`a[href], button`)에서 폼 컨트롤까지 넓혔다 — 검색 오버레이처럼
 * input 이 든 다이얼로그에서도 갇히게.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface UseDialogBehaviorOptions {
  open: boolean
  onClose: () => void
  /** 다이얼로그 컨테이너 — focus trap 의 범위. */
  ref: RefObject<HTMLElement | null>
  /** 닫힌 뒤 포커스를 되돌릴 트리거. 없으면 복귀를 생략한다. */
  triggerRef?: RefObject<HTMLElement | null>
  /** false 면 Escape 를 무시한다(처리 중 잠금). 기본 true. */
  dismissible?: boolean
}

export function useDialogBehavior({
  open,
  onClose,
  ref,
  triggerRef,
  dismissible = true,
}: UseDialogBehaviorOptions): void {
  // 콜백·플래그는 ref 로 읽는다. deps 에 넣으면 인라인 화살표 함수가 매 렌더 새 참조라
  // 열려 있는 내내 effect 가 재실행되고, 그때마다 body overflow 를 저장/복원하고 포커스를
  // 트리거로 되돌려버린다.
  const latest = useRef({ onClose, dismissible })
  latest.current = { onClose, dismissible }

  useEffect(() => {
    if (!open) return
    const dialog = ref.current
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])

    // 열리면 포커스를 다이얼로그 안으로. 단 이미 안에 있으면 뺏지 않는다 — `autoFocus` 로
    // 커맨드팔레트 input 에 포커스를 준 표면(StageSearchOverlay)이 첫 링크로 튕기지 않게.
    if (!dialog?.contains(document.activeElement)) focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (latest.current.dismissible) latest.current.onClose()
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      triggerRef?.current?.focus()
    }
  }, [open, ref, triggerRef])
}
