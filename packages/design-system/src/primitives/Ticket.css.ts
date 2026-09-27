import { createVar, style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 티켓 — 공연 한 건을 실물 티켓의 형태로 세우는 종이.
 *
 * 카드와 다른 점은 **뜯어내는 쪽(stub)** 하나다. 천공선이 "여기가 잘리는 자리"를 말해서,
 * 스텁에 놓인 것(예매·담기)이 본문과 다른 성격의 동작이라는 걸 형태가 먼저 알린다.
 * bandcamp 앨범 플레이어 행의 우측 점선 3칸이 같은 일을 한다 — 그 자리를 티켓으로 옮긴 것.
 *
 * 여기서 그리는 건 **종이·천공선까지**다. 날짜 펀치·일련번호·포스터 돌출은 내용이라
 * 소비처가 얹는다. 시안 `1418:8`(데스크탑 행) · `1423:17`(모바일).
 */

/**
 * @deprecated 노치를 걷어내면서 칠할 곳이 없어졌다 — 값을 넣어도 아무 효과가 없다. 다음 major 에서 지운다.
 */
export const ticketGround = createVar()

export const ticket = style(inComponentsLayer({ position: 'relative', display: 'flex' }))

/**
 * 종이 — `Ticket` · `Ticket.Raised` · `Ticket.Muted` 가 하나씩 고른다.
 *
 * 종이 속성(색·테두리·모서리·그림자)은 **여기에만** 있다. base 에 깔고 변형이 덮으면 같은
 * 레이어 안의 두 클래스가 소스 순서로 다툰다.
 */
export const ticketPaper = styleVariants({
  plain: inComponentsLayer({
    background: vars.color.surface,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
  }),
  /** 바닥에서 떠오른 흰 종이 — 묶음의 얼굴(픽)처럼 한 장이 먼저 읽혀야 할 때. */
  raised: inComponentsLayer({
    background: vars.color.surface,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius['2xl'],
    boxShadow: vars.shadow.sm,
  }),
  /** 흰 바닥에 가라앉은 회색 종이 — 떠오른 종이 옆에서 한 단 물러선다. 테두리 없이 면으로만. */
  muted: inComponentsLayer({
    background: vars.color.bg,
    border: '1px solid transparent',
    borderRadius: vars.radius.xl,
  }),
})

/**
 * 스텁이 붙는 변. `row` 는 오른쪽(데스크탑 행), `stacked` 는 아래(모바일).
 *
 * ⚠️ `flexDirection` 은 **여기에만** 있다 — base 에 깔면 `ds-utilities` 가 레이어로 이겨
 * 변형이 통째로 죽는다(한 속성은 한 레이어).
 */
export const ticketOrientation = styleVariants({
  row: inComponentsLayer({ flexDirection: 'row', alignItems: 'stretch' }),
  stacked: inComponentsLayer({ flexDirection: 'column' }),
  /** 좁은 화면에서 `stacked`, tablet 부터 `row`. 티켓이 기본으로 원하는 거동이다. */
  responsive: inComponentsLayer({
    flexDirection: 'column',
    '@media': { [media.tablet]: { flexDirection: 'row', alignItems: 'stretch' } },
  }),
})

export const ticketStub = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
  }),
)

/** 천공선 — 스텁의 앞 테두리. */
export const stubOrientation = styleVariants({
  row: inComponentsLayer({
    flexDirection: 'column',
    borderLeft: `1.5px dashed ${vars.color.border}`,
  }),
  stacked: inComponentsLayer({
    flexDirection: 'row',
    borderTop: `1.5px dashed ${vars.color.border}`,
  }),
  /** 방향이 뒤집히면 천공선도 같이 눕는다. */
  responsive: inComponentsLayer({
    flexDirection: 'row',
    borderTop: `1.5px dashed ${vars.color.border}`,
    borderLeft: 'none',
    '@media': {
      [media.tablet]: {
        flexDirection: 'column',
        borderTop: 'none',
        borderLeft: `1.5px dashed ${vars.color.border}`,
      },
    },
  }),
})
