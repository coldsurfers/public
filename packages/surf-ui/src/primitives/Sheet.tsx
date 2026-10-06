import type { ReactNode } from 'react'
import { cx } from './cx'
import { Modal, type ModalProps } from './Modal'
import * as s from './Sheet.css'

/**
 * 아래 시트 — Figma `1028:381`. 모바일은 화면 아래에 붙고, 데스크탑(≥1024)은 가운데 모달(최대 560)이 된다.
 * 행동 · portal · 면 모드는 `Modal` 이 들고, 여기는 패널 모양(r28 · 손잡이 · safe-area)만 더한다.
 */
export interface SheetProps extends Omit<ModalProps, 'placement' | 'panelClassName'> {
  /** 맨 위 「무엇을 고른 건지」 한 줄 — 보통 `MediaRow`. */
  head?: ReactNode
  /** 패널 추가 클래스. */
  className?: string
}

export function Sheet({ head, className, children, ...modal }: SheetProps) {
  return (
    <Modal {...modal} placement="sheet" panelClassName={cx(s.panel, className)}>
      <span className={s.handle} aria-hidden />
      <div className={s.body}>
        {head}
        {children}
      </div>
    </Modal>
  )
}
