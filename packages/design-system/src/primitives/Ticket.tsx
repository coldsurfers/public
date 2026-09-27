import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { stubOrientation, ticket, ticketOrientation, ticketPaper, ticketStub } from './Ticket.css'

export type TicketOrientation = 'row' | 'stacked' | 'responsive'

export interface TicketProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 스텁이 붙는 변 — `row` 는 오른쪽, `stacked` 는 아래, `responsive` 는 tablet 을 경계로 둘을
   * 오간다. 기본이 `responsive` 인 건 좁은 화면에서 세로 천공선을 유지하면 본문이 눌려서다.
   */
  orientation?: TicketOrientation
  /**
   * 뜯어내는 쪽의 내용. 천공선은 `Ticket` 이 그린다 — 소비처가 빠뜨릴 수 없게.
   * 없으면 티켓은 그냥 종이 한 장이 된다.
   */
  stub?: ReactNode
  /** 스텁 치수(폭·패딩·정렬)는 소비처가 정한다. */
  stubClassName?: string
}

function TicketPaper({
  paper,
  orientation = 'responsive',
  stub,
  stubClassName,
  className,
  children,
  ...rest
}: TicketProps & { paper: keyof typeof ticketPaper }) {
  return (
    <div
      className={cx(ticket, ticketPaper[paper], ticketOrientation[orientation], className)}
      {...rest}
    >
      {children}
      {stub ? (
        <div className={cx(ticketStub, stubOrientation[orientation], stubClassName)}>{stub}</div>
      ) : null}
    </div>
  )
}

/**
 * 실물 티켓 형태의 종이 — 본체 + 뜯어내는 스텁.
 *
 * 치수·타이포·내용은 전부 소비처의 몫이고, 여기가 책임지는 건 **형태**(종이·천공선)뿐이다.
 * 종이가 달라야 하면 `Ticket.Raised` · `Ticket.Muted` 로 온다. 자세한 배경은 `Ticket.css.ts` 머리 주석.
 */
export function Ticket(props: TicketProps) {
  return <TicketPaper paper="plain" {...props} />
}

/** 바닥에서 떠오른 흰 종이 — 모서리 `2xl` · 그림자 `sm`. 묶음의 얼굴(픽)처럼 한 장이 먼저 읽혀야 할 때. */
function RaisedTicket(props: TicketProps) {
  return <TicketPaper paper="raised" {...props} />
}

/** 흰 바닥에 가라앉은 회색 종이 — 모서리 `xl` · 테두리 없음. 떠오른 종이 옆에서 한 단 물러선다. */
function MutedTicket(props: TicketProps) {
  return <TicketPaper paper="muted" {...props} />
}

/** 종이별 문 — `ConcertCard.Framed` 와 같은 관용구. 각 문의 설명은 가리켜진 컴포넌트의 JSDoc 이 정본. */
Ticket.Raised = RaisedTicket
Ticket.Muted = MutedTicket
