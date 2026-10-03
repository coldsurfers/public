import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'
import { popoverAnchor, popoverMenu } from './Popover.css'

/**
 * 트리거 + 팝오버 뼈대 — `Select`(버튼+옵션 listbox)·`BSideGroupChip`(Chip+링크 menu)이 공유하던
 * open 상태·바깥클릭/Escape 닫기·위치잡기·뷰포트 maxHeight 를 한 어휘로 수렴한다.
 *
 * 위치잡기는 `createPortal(document.body)` + `position: fixed`(트리거 rect 측정) 한 전략으로 통일 —
 * 어떤 `overflow`/`transform` 조상 안에서도 클립되지 않는다(칩 바처럼 `overflow` 클립된 곳 포함).
 * 트리거는 `inline-flex span` 앵커로 감싸 측정하므로 트리거 컴포넌트에 `forwardRef` 를 강제하지 않는다.
 *
 * dismiss: 바깥 mousedown · Escape · **앵커를 품은 스크롤러**의 스크롤(capture) · resize(재측정).
 * `fixed` 좌표는 앵커가 움직여야 어긋나므로, 앵커와 무관한 스크롤러(메뉴 내부의 긴 옵션 목록 ·
 * 옆에 놓인 가로 칩 줄)는 무시한다.
 */
export interface PopoverProps {
  /** 트리거 — `open`/`toggle` 을 받아 칩·버튼 등을 렌더. */
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  /** 팝오버 본문 — `close` 로 항목 선택 시 닫는다. */
  children: (props: { close: () => void }) => ReactNode
  /** 메뉴 컨테이너의 접근성 role. */
  role?: 'menu' | 'listbox'
  /** 트리거 하단과 메뉴 사이 간격(px). 기본 6. */
  offset?: number
  /** 앵커 span 추가 클래스(정렬 등). */
  className?: string
  /**
   * 메뉴 박스 클래스 — 표면 장식 전체를 소비처가 든다. 기본 표면을 원하면
   * `cx(POPOVER_MENU_CLS, '…')` 로 조합한다.
   */
  menuClassName?: string
}

/** 팝오버가 뷰포트 바닥에 닿지 않도록 남길 최소 여백(px). */
const VIEWPORT_GAP = 16

/** 기본 메뉴 표면 — 정의는 `Popover.css.ts`. 소비처가 `cx(POPOVER_MENU_CLS, …)` 로 골라 쓴다. */
export { POPOVER_MENU_CLS } from './Popover.css'

export function Popover({
  trigger,
  children,
  role,
  offset = 6,
  className,
  menuClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [box, setBox] = useState<{
    top: number
    left?: number
    right?: number
    maxWidth: number
    maxHeight: number
  }>()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    if (!anchor) return
    const measure = () => {
      const r = anchor.getBoundingClientRect()
      const vw = window.innerWidth
      const top = r.bottom + offset
      // 트리거가 뷰포트 오른쪽 절반이면 우측 모서리 기준 정렬(메뉴가 왼쪽으로 자람) → 오른쪽 잘림 방지.
      const alignRight = r.left + r.width / 2 > vw / 2
      setBox({
        top,
        left: alignRight ? undefined : Math.max(r.left, VIEWPORT_GAP),
        right: alignRight ? Math.max(vw - r.right, VIEWPORT_GAP) : undefined,
        maxWidth: vw - VIEWPORT_GAP * 2,
        maxHeight: Math.max(120, window.innerHeight - top - VIEWPORT_GAP),
      })
    }
    measure()
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (!anchor.contains(target) && !menuRef.current?.contains(target)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScroll = (e: Event) => {
      // 닫는 근거는 「스크롤했다」가 아니라 **「앵커가 움직였다」**다 — 메뉴는 `fixed` 라
      // 앵커 rect 로 잡은 좌표가 어긋나야 닫을 이유가 생긴다.
      //
      // 그래서 판정은 한 줄이다: **이 스크롤러가 앵커를 품고 있나.**
      //   - 페이지 스크롤 → target 은 `document` 고 `document.contains(anchor)` 는 참 → 닫는다
      //   - 앵커를 감싼 패널이 스크롤 → 참 → 닫는다
      //   - 메뉴 안쪽(긴 옵션 목록) → 메뉴는 body 로 portal 되어 앵커를 안 품는다 → 유지
      //   - **앵커와 무관한 스크롤러**(칩 줄 같은 가로 스크롤러) → 유지
      //
      // 마지막 줄이 이 판정을 좁힌 이유다. 예전엔 「메뉴 밖에서 난 스크롤」이면 전부 닫았는데,
      // 그러면 팝오버 아래에 있는 가로 칩 줄이 관성으로 굴러가는 중에 트리거를 누를 때
      // **열리자마자 닫혔다.** 그 줄은 앵커를 한 픽셀도 안 움직인다.
      const scroller = e.target
      if (scroller instanceof Node && !scroller.contains(anchor)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', measure)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', measure)
    }
  }, [open, offset])

  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)

  return (
    <span ref={anchorRef} className={cx(popoverAnchor, className)}>
      {trigger({ open, toggle })}
      {open && box
        ? createPortal(
            <div
              ref={menuRef}
              role={role}
              style={{
                top: box.top,
                left: box.left,
                right: box.right,
                maxWidth: box.maxWidth,
                maxHeight: box.maxHeight,
              }}
              className={cx(popoverMenu, menuClassName)}
            >
              {children({ close })}
            </div>,
            document.body,
          )
        : null}
    </span>
  )
}
