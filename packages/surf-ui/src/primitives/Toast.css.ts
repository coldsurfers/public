import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { alpha } from '../css/style-utils'

/**
 * 하단 중앙 pill 토스트 — Figma Page 7 `Toast — 규격·변형`(990:2).
 *
 * 색은 `text`/`bg` 한 쌍이다 — 스킴이 뒤집히면 pill 도 같이 뒤집혀 **어느 표면에 얹혀도
 * 바닥과 반대색**이 된다. 표면마다 색을 따로 주지 않는 이유.
 *
 * breakpoint 는 `design-system` 의 `media.tablet`(768px) — 기존 `tablet:bottom-8` 등가.
 */
export const toast = recipe({
  base: inComponentsLayer({
    position: 'fixed',
    bottom: 20,
    left: '50%',
    zIndex: 60,
    display: 'flex',
    width: 'max-content',
    maxWidth: 'min(92vw, 420px)',
    alignItems: 'center',
    gap: 8,
    borderRadius: vars.radius.full,
    background: vars.color.textPrimary,
    color: vars.color.bgBase,
    padding: '11px 18px',
    fontWeight: vars.fontWeight.medium,
    fontSize: 13.5,
    boxShadow: vars.shadow.md,
    pointerEvents: 'none',
    transitionProperty: 'opacity, transform',
    transitionDuration: '200ms',
    '@media': {
      [media.tablet]: { bottom: 32 },
    },
  }),

  variants: {
    /** 떠 있는가 — 위치 이동은 언제나 `translateX(-50%)` 위에 얹힌다. */
    visible: {
      true: inComponentsLayer({ transform: 'translate(-50%, 0)', opacity: 1 }),
      false: inComponentsLayer({ transform: 'translate(-50%, 12px)', opacity: 0 }),
    },
    /**
     * 두 줄(`description`) 상자 — Figma `3743:1364`. 알약 모서리는 두 줄 높이에서 타원이 되므로
     * 16 으로 접고, 폭을 상한까지 편다(액션이 오른쪽 끝에 붙는다).
     */
    stacked: {
      true: inComponentsLayer({
        width: 'min(92vw, 420px)',
        gap: 12,
        borderRadius: 16,
        padding: '14px 18px',
      }),
      false: {},
    },
  },

  defaultVariants: { visible: false, stacked: false },
})

/** error 톤의 선행 점. */
export const toastErrorDot = style(
  inComponentsLayer({
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: vars.radius.full,
    background: vars.color.actionPrimary,
  }),
)

/** 메시지 + 둘째 줄 기둥. 액션이 옆에 서도 긴 메시지가 액션을 밀어내지 않게. */
export const toastCopy = style(
  inComponentsLayer({
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  }),
)

export const toastMessage = style(
  inComponentsLayer({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

/** 둘째 줄 — 색 축은 `contract/toast.ts` 의 표. */
export const toastDescription = style(
  inComponentsLayer({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: alpha(vars.color.bgBase, 70),
    fontWeight: vars.fontWeight.regular,
    fontSize: 13,
  }),
)

/**
 * 액션 — 토스트에서 **유일하게 누를 수 있는 자리**다. 바탕은 `pointer-events: none` 이라 아래
 * 화면을 가로막지 않고, 이 버튼만 되살린다.
 */
export const toastAction = style(
  inComponentsLayer({
    flexShrink: 0,
    border: 'none',
    background: 'transparent',
    padding: 0,
    color: vars.color.actionPrimary,
    fontWeight: vars.fontWeight.semibold,
    fontSize: 13,
    cursor: 'pointer',
    pointerEvents: 'auto',
  }),
)
