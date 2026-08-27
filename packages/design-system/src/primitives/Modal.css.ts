import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/**
 * 백드롭 + 패널. 정렬·배경·폭은 소비처가 `overlayClassName`/`panelClassName` 으로 정한다 —
 * 여기서는 "화면을 덮는다"와 "테두리 있는 면"까지만 든다.
 */
export const modalOverlay = style(
  inComponentsLayer({
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    padding: 16,
  }),
)

/**
 * 패널은 **절대 화면을 넘지 않는다** — `maxHeight: 100%` 는 오버레이의 content box(=뷰포트 − 여백 32)다.
 * 넘치는 내용은 패널이 아니라 `modalBody` 가 받는다: 테두리·radius·여백은 제자리에 있고 안쪽만 구른다.
 *
 * `overflow` 를 여기 두지 않는 이유 — 소비처가 이미 이 속성을 쓰고 있다(`searchPanel` 의
 * `overflow: hidden` 이 radius 클리핑을 든다). 「한 속성은 한 레이어」라 스크롤 축은 아래 자식이 갖는다.
 */
export const modalPanel = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: '100%',
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  }),
)

/**
 * 내용 래퍼 — 길어지면 여기가 스크롤한다.
 *
 * `minHeight: 0` 이 없으면 flex 자식의 최소 크기가 내용 높이라 패널의 `maxHeight` 를 밀어낸다
 * (스크롤이 안 생기는 흔한 원인). `overscrollBehavior` 는 끝까지 굴렸을 때 뒤 페이지가 따라 밀리는 것을 막는다.
 */
export const modalBody = style(
  inComponentsLayer({
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  }),
)
