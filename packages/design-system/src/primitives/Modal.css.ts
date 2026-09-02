import { style, styleVariants } from '@vanilla-extract/css'
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
  }),
)

/**
 * 패널이 서는 자리. **정렬 축은 여기 하나뿐**이다 — 소비처 실측 5곳 중 4곳이
 * `sprinkles({ alignItems: 'center', justifyContent: 'center' })` 를 문자 그대로 복붙하고
 * 있었고, 나머지 하나(검색 오버레이)만 위쪽 정렬이었다. 축이 없던 게 아니라 기본값이 없었다.
 *
 * ⚠️ `padding` 이 base 가 아니라 여기 있는 이유 — `bottom` 은 시트가 화면 아래 모서리에
 * 붙어야 해서 여백이 0이다. base 에 남기고 여기서 덮으면 같은 레이어 안에서 **소스 순서**로
 * 갈리는 규칙이 되고, 그건 파일을 재배열하는 순간 조용히 깨진다(한 속성은 한 레이어).
 *
 * `bottom` 이 드는 건 정렬·여백까지다. 시트의 상단 radius 와 `env(safe-area-inset-bottom)`
 * 는 **소비처가 `panelClassName` 으로 준다** — `modalPanel` 은 애초에 radius·padding 을
 * 소유하지 않고, sprinkles(`ds-utilities`)가 `ds-components` 를 이기므로 여기서 padding 을
 * 얹으면 `sprinkles({ padding: ... })` 를 쓰는 소비처에서 조용히 사라진다.
 */
export const modalPlacement = styleVariants(
  {
    center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
    top: { alignItems: 'flex-start', justifyContent: 'center', padding: 16 },
    bottom: { alignItems: 'flex-end', justifyContent: 'center', padding: 0 },
  },
  inComponentsLayer,
)

export type ModalPlacement = keyof typeof modalPlacement

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
