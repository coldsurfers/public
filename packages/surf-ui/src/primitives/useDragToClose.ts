import { type MouseEvent, type PointerEvent, type RefObject, useRef } from 'react'

/** 이만큼 끌어내리면 닫는다(px). */
const CLOSE_DISTANCE = 80
/** 이보다 빨리 튕기면 거리가 모자라도 닫는다(px/ms). */
const CLOSE_VELOCITY = 0.5
const SNAP_BACK = 'transform 200ms ease-out'
/** 놓은 뒤 화면 밖으로 내려가는 시간(ms). */
export const THROW_MS = 200

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 이만큼 내려와야 끌기다 — 그 전에 떼면 탭이라 머리 안 링크 · 클릭이 그대로 산다(px). */
const DRAG_SLOP = 6

/**
 * 시트 머리를 잡고 끌어내려 닫기 — 패널이 손가락을 따라 내려가고, 놓으면 닫거나 제자리로 돌아간다.
 * 위로는 안 끌린다. 터치 · 펜만 받는다(마우스 = 데스크탑 모달). 버튼 · 입력칸을 누른 건 끌기가 아니다.
 * 링크 위에서도 끌린다 — `DRAG_SLOP` 을 넘어야 포인터를 붙잡고, 끈 뒤 따라오는 클릭 한 번은 막는다.
 *
 * @param panelRef 움직일 패널.
 * @param onThrown 패널이 화면 밖으로 내려간 뒤 — 이미 퇴장했으니 퇴장 애니메이션 없이 닫는다.
 * @returns 머리에 펼칠 포인터 · 클릭 핸들러.
 */
export function useDragToClose(panelRef: RefObject<HTMLElement | null>, onThrown: () => void) {
  const drag = useRef<{ startY: number; startAt: number; dy: number; active: boolean } | null>(null)
  const dragged = useRef(false)

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    dragged.current = false
    if (!panelRef.current || e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return
    drag.current = { startY: e.clientY, startAt: e.timeStamp, dy: 0, active: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const panel = panelRef.current
    const current = drag.current
    if (!panel || !current) return
    current.dy = Math.max(0, e.clientY - current.startY)
    if (!current.active) {
      if (current.dy < DRAG_SLOP) return
      current.active = true
      e.currentTarget.setPointerCapture(e.pointerId)
      panel.style.transition = 'none'
    }
    panel.style.transform = `translateY(${current.dy}px)`
  }

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const panel = panelRef.current
    const current = drag.current
    drag.current = null
    if (!panel || !current?.active) return
    dragged.current = true
    const velocity = current.dy / Math.max(1, e.timeStamp - current.startAt)
    const reduced = prefersReducedMotion()
    if (current.dy > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
      if (reduced) return onThrown()
      panel.style.transition = `transform ${THROW_MS}ms ease-in`
      panel.style.transform = 'translateY(100%)'
      window.setTimeout(onThrown, THROW_MS)
      return
    }
    panel.style.transition = reduced ? 'none' : SNAP_BACK
    panel.style.transform = ''
  }

  /** 끈 뒤 따라오는 클릭 — 링크에서 시작한 끌기가 이동으로 끝나지 않게 한 번 막는다. */
  const onClickCapture = (e: MouseEvent<HTMLElement>) => {
    if (!dragged.current) return
    dragged.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture }
}
