import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { stubOrientation, ticket, ticketGround, ticketOrientation, ticketStub } from './Ticket.css'

/**
 * 지면색을 바꿔 끼우는 자리 — 노치가 파여 드러나는 색. 기본은 warm-paper 캔버스라
 * 그 위에서는 손댈 일이 없다. 다른 바닥에 앉힐 때만 `style` 로 덮는다.
 */
export { ticketGround }

export type TicketOrientation = 'row' | 'stacked' | 'responsive'

export interface TicketProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 스텁이 붙는 변 — `row` 는 오른쪽, `stacked` 는 아래, `responsive` 는 tablet 을 경계로 둘을
   * 오간다. 기본이 `responsive` 인 건 좁은 화면에서 세로 천공선을 유지하면 본문이 눌려서다.
   */
  orientation?: TicketOrientation
  /**
   * 뜯어내는 쪽의 내용. 천공선·노치는 `Ticket` 이 그린다 — 소비처가 빠뜨릴 수 없게.
   * 없으면 티켓은 그냥 종이 한 장이 된다.
   */
  stub?: ReactNode
  /** 스텁 치수(폭·패딩·정렬)는 소비처가 정한다. */
  stubClassName?: string
}

/**
 * 실물 티켓 형태의 종이 — 본체 + 뜯어내는 스텁.
 *
 * 치수·타이포·내용은 전부 소비처의 몫이고, 여기가 책임지는 건 **형태**(종이·천공선·노치)뿐이다.
 * 자세한 배경은 `Ticket.css.ts` 머리 주석.
 */
export function Ticket({
  orientation = 'responsive',
  stub,
  stubClassName,
  className,
  children,
  ...rest
}: TicketProps) {
  return (
    <div className={cx(ticket, ticketOrientation[orientation], className)} {...rest}>
      {children}
      {stub ? (
        <div className={cx(ticketStub, stubOrientation[orientation], stubClassName)}>{stub}</div>
      ) : null}
    </div>
  )
}
