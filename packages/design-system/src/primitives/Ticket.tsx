import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { stubNotch, stubOrientation, ticket, ticketOrientation, ticketStub } from './Ticket.css'

/**
 * 종이를 바꿔 끼우는 손잡이 — 지면색(노치)·종이 색·가장자리·모서리·그림자.
 *
 * DS 가 선언하지 않는 변수라 소비처는 자기 클래스의 `vars` 에서든 조상에서든 넣으면 이긴다.
 * `Ticket` 내부 엘리먼트로 뻗는 규칙을 쓰지 않아도 된다.
 */
export { ticketEdge, ticketGround, ticketPaper, ticketRadius, ticketShadow } from './Ticket.css'

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
  /** 천공선 양 끝의 노치. 기본은 켠다 — 천공선과 스텁만으로 티켓이 읽히는 지면에서 끈다. */
  notch?: boolean
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
  notch = true,
  stubClassName,
  className,
  children,
  ...rest
}: TicketProps) {
  return (
    <div className={cx(ticket, ticketOrientation[orientation], className)} {...rest}>
      {children}
      {stub ? (
        <div
          className={cx(
            ticketStub,
            notch && stubNotch,
            stubOrientation[orientation],
            stubClassName,
          )}
        >
          {stub}
        </div>
      ) : null}
    </div>
  )
}
