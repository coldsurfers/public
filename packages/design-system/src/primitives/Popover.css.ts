import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'

/** 트리거를 감싸 rect 를 재는 앵커. 측정용이라 레이아웃에 개입하지 않는다. */
export const popoverAnchor = style(inComponentsLayer({ display: 'inline-flex' }))

/** 위치잡기만. 표면 장식은 소비처가 `POPOVER_MENU_CLS` 로 골라 얹는다. */
export const popoverMenu = style(
  inComponentsLayer({
    position: 'fixed',
    zIndex: 30,
  }),
)

/**
 * 기본 메뉴 표면 — 테두리·배경·패딩·그림자 + `maxHeight` 스크롤.
 *
 * `Popover` 가 **강제하지 않고** 소비처가 골라 쓴다. 강제하면 다른 표면을 원하는 메뉴
 * (`MvpHeader` 의 AccountMenu 처럼 패딩 0·자체 그림자)가 base 와 같은 속성을 놓고 충돌한다.
 *
 * > 옛 주석은 *"`cx` 는 단순 이어붙이기라 뒤에 쓴다고 이기지 않는다"* 고 적었다. 그 문제는
 * > **레이어가 해결한다** — 이 스타일은 `ds-components` 에 있고 소비처가 얹는 유틸은 더 뒤
 * > 레이어라 항상 이긴다. 그럼에도 표면을 강제하지 않는 설계는 유지한다: 승자가 정해지는 것과
 * > "무엇이 기본이어야 하는가"는 다른 문제이고, 후자는 여전히 소비처가 안다.
 */
export const POPOVER_MENU_CLS = style(
  inComponentsLayer({
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
    padding: 4,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  }),
)
