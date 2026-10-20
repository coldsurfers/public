import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { TOAST_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { colorSchemes } from '../tokens'

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
    gap: spec.gap.single,
    borderRadius: vars.radius[spec.radius.single],
    background: vars.color.textPrimary,
    color: vars.color.bgBase,
    paddingBlock: spec.paddingBlock,
    paddingInline: spec.paddingInline,
    fontWeight: vars.fontWeight[spec.message.fontWeight],
    fontSize: vars.fontSize[spec.message.fontSize],
    boxShadow: vars.shadow.md,
    pointerEvents: 'none',
    transitionProperty: 'opacity, transform, visibility',
    transitionDuration: '200ms',
    '@media': {
      [media.tablet]: { bottom: 32 },
    },
  }),

  variants: {
    /** 떠 있는가 — 위치 이동은 언제나 `translateX(-50%)` 위에 얹힌다. */
    visible: {
      true: inComponentsLayer({ transform: 'translate(-50%, 0)', opacity: 1 }),
      false: inComponentsLayer({
        transform: 'translate(-50%, 12px)',
        opacity: 0,
        visibility: 'hidden',
      }),
    },
    /**
     * 두 줄(`description`) 상자 — Figma `3743:1364`. 폭을 상한까지 편다(액션이 오른쪽 끝에
     * 붙는다).
     */
    stacked: {
      true: inComponentsLayer({
        width: 'min(92vw, 420px)',
        gap: spec.gap.stacked,
        borderRadius: spec.radius.stacked,
      }),
      false: {},
    },
  },

  defaultVariants: { visible: false, stacked: false },
})

/** error 톤의 선행 점. */
export const toastErrorDot = style(
  inComponentsLayer({
    width: spec.dotSize,
    height: spec.dotSize,
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
    gap: spec.copyGap,
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
    color: colorSchemes.ink.textSecondary,
    fontWeight: vars.fontWeight[spec.description.fontWeight],
    fontSize: vars.fontSize[spec.description.fontSize],
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
    color: colorSchemes.ink.kicker,
    fontWeight: vars.fontWeight[spec.action.fontWeight],
    fontSize: vars.fontSize[spec.action.fontSize],
    cursor: 'pointer',
    pointerEvents: 'auto',
  }),
)
