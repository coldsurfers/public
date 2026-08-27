import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

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
    maxWidth: 'min(92vw, 420px)',
    alignItems: 'center',
    gap: 8,
    borderRadius: vars.radius.full,
    background: vars.color.text,
    color: vars.color.bg,
    padding: '11px 18px',
    fontWeight: vars.fontWeight.medium,
    fontSize: 13.5,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
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
  },

  defaultVariants: { visible: false },
})

/** error 톤의 선행 점. */
export const toastErrorDot = style(
  inComponentsLayer({
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: vars.radius.full,
    background: vars.color.accent,
  }),
)

export const toastMessage = style(
  inComponentsLayer({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)
