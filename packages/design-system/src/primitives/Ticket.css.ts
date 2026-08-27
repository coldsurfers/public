import { createVar, style, styleVariants } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 티켓 — 공연 한 건을 실물 티켓의 형태로 세우는 종이.
 *
 * 카드와 다른 점은 **뜯어내는 쪽(stub)** 하나다. 천공선과 노치가 "여기가 잘리는 자리"를 말해서,
 * 스텁에 놓인 것(예매·담기)이 본문과 다른 성격의 동작이라는 걸 형태가 먼저 알린다.
 * bandcamp 앨범 플레이어 행의 우측 점선 3칸이 같은 일을 한다 — 그 자리를 티켓으로 옮긴 것.
 *
 * 여기서 그리는 건 **종이·천공선·노치까지**다. 날짜 펀치·일련번호·포스터 돌출은 내용이라
 * 소비처가 얹는다. 시안 `1418:8`(데스크탑 행) · `1423:17`(모바일).
 */

/**
 * 노치가 파여 드러나는 바닥색 — 티켓이 앉은 지면.
 *
 * 노치는 구멍이 아니라 **지면색 원**이다(진짜로 뚫으면 종이의 테두리까지 잘라야 하는데,
 * `mask-composite` 없이는 그게 안 된다). 그래서 지면이 바뀌면 이 값도 같이 바뀌어야 한다.
 * 기본값은 warm-paper 캔버스라, 그 위에 놓는 표면은 아무것도 안 해도 된다.
 */
export const ticketGround = createVar()

/** 노치 지름. 천공선이 종이 테두리와 만나는 자리를 이만큼 베어 문다. */
const NOTCH = '16px'

export const ticket = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    background: vars.color.surface,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.md,
    vars: { [ticketGround]: vars.paper.warm },
  }),
)

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

/**
 * 노치 한 짝의 공통 — 자리만 방향별로 갈린다.
 *
 * ⚠️ **테두리가 없으면 노치는 안 보인다.** 지면(#fafaf7)과 종이(#fff)의 차이가 2% 라
 * 채움만으로는 흰 종이 위 흰 원이다. 실물에서 눈에 띄는 건 색이 아니라 **잘린 종이의 가장자리**
 * 라, 종이와 같은 테두리를 둘러야 구멍으로 읽힌다(시안 `1418:19` 도 fill + 1px stroke).
 */
const notch = {
  content: '""',
  position: 'absolute',
  boxSizing: 'border-box',
  width: NOTCH,
  height: NOTCH,
  borderRadius: vars.radius.full,
  background: ticketGround,
  border: `1px solid ${vars.color.border}`,
} as const

/** 천공선 위에 중심을 놓을 때 — 천공선은 스텁의 테두리라 스텁 변이 곧 선이다. */
const HALF = `calc(${NOTCH} / -2)`
/** 종이 변에 중심을 놓을 때 — 스텁은 종이 테두리(1px) 안쪽에서 시작해 그만큼 더 나가야 한다. */
const EDGE = `calc(${NOTCH} / -2 - 1px)`

export const ticketStub = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    '::before': notch,
    '::after': notch,
  }),
)

/** 천공선(스텁의 앞 테두리)과 그 선이 종이 테두리와 만나는 두 자리의 노치. */
export const stubOrientation = styleVariants({
  row: inComponentsLayer({
    flexDirection: 'column',
    borderLeft: `1.5px dashed ${vars.color.border}`,
    // 원의 중심이 천공선 위에(left), 종이의 위·아래 변에(top·bottom) 놓이게 당긴다.
    '::before': { top: EDGE, left: HALF },
    '::after': { bottom: EDGE, left: HALF },
  }),
  stacked: inComponentsLayer({
    flexDirection: 'row',
    borderTop: `1.5px dashed ${vars.color.border}`,
    '::before': { top: HALF, left: EDGE },
    '::after': { top: HALF, right: EDGE },
  }),
  /**
   * 방향이 뒤집히면 천공선도 같이 눕는다. `::before` 만 두 방향에서 좌표가 같다 —
   * 가로 천공선의 왼쪽 끝과 세로 천공선의 위쪽 끝이 같은 모서리이기 때문.
   */
  responsive: inComponentsLayer({
    flexDirection: 'row',
    borderTop: `1.5px dashed ${vars.color.border}`,
    borderLeft: 'none',
    '::before': { top: HALF, left: EDGE },
    '::after': { top: HALF, right: EDGE },
    '@media': {
      [media.tablet]: {
        flexDirection: 'column',
        borderTop: 'none',
        borderLeft: `1.5px dashed ${vars.color.border}`,
        // 방향이 바뀌면 천공선 축(HALF)과 종이 변 축(EDGE)이 서로 자리를 바꾼다.
        '::before': { top: EDGE, left: HALF },
        '::after': { top: 'auto', right: 'auto', bottom: EDGE, left: HALF },
      },
    },
  }),
})
