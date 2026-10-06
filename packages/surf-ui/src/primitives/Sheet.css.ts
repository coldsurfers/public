import { keyframes, style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { alpha } from '../css/style-utils'

/** 퇴장 시간(ms) — 이만큼 그린 채로 두었다가 내린다. */
export const EXIT_MS = 200

const ENTER = '280ms cubic-bezier(0.2, 0.8, 0.2, 1)'
const EXIT = `${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`
const REDUCED = '(prefers-reduced-motion: reduce)'

const slideIn = keyframes({ from: { transform: 'translateY(100%)' }, to: { transform: 'none' } })
const slideOut = keyframes({ from: { transform: 'none' }, to: { transform: 'translateY(100%)' } })
const popIn = keyframes({
  from: { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
  to: { opacity: 1, transform: 'none' },
})
const popOut = keyframes({
  from: { opacity: 1, transform: 'none' },
  to: { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
})
const fadeIn = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
const fadeOut = keyframes({ from: { opacity: 1 }, to: { opacity: 0 } })

/** 시트 뒤 — 화면을 덮는 `overlay` 역할 60%. 같이 페이드한다. */
export const overlay = style(
  inComponentsLayer({
    background: alpha(vars.color.overlay, 60),
    animation: `${fadeIn} ${ENTER}`,
    '@media': { [REDUCED]: { animation: 'none' } },
  }),
)

/** 닫히는 중 — 누름을 받지 않는다. */
export const overlayClosing = style(
  inComponentsLayer({
    pointerEvents: 'none',
    animation: `${fadeOut} ${EXIT}`,
    '@media': { [REDUCED]: { animation: 'none' } },
  }),
)

/**
 * 시트 패널 — Figma `1028:381`. 모바일은 위만 r28 · 아래에서 올라오고, 데스크탑은 가운데 모달 최대 560 · 살짝 떠오른다.
 * 머리 · 아래는 고정, 내용만 구른다 — 그래서 패널은 넘치는 걸 자른다.
 */
export const panel = style(
  inComponentsLayer({
    overflow: 'hidden',
    borderRadius: `${vars.shape.radiusSheet} ${vars.shape.radiusSheet} 0 0`,
    animation: `${slideIn} ${ENTER}`,
    '@media': {
      [media.desktop]: {
        maxWidth: 560,
        borderRadius: vars.shape.radiusSheet,
        animation: `${popIn} ${ENTER}`,
      },
      [REDUCED]: { animation: 'none' },
    },
  }),
)

export const panelClosing = style(
  inComponentsLayer({
    animation: `${slideOut} ${EXIT}`,
    '@media': {
      [media.desktop]: { animation: `${popOut} ${EXIT}` },
      [REDUCED]: { animation: 'none' },
    },
  }),
)

/** 머리 — 손잡이 + `head`. 모바일에선 잡고 끌어내리는 자리라 브라우저 스크롤 제스처를 끈다. */
export const head = style(
  inComponentsLayer({
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '10px 20px 16px',
    touchAction: 'none',
    '@media': { [media.desktop]: { padding: '28px 28px 16px', touchAction: 'auto' } },
  }),
)

/** `head` 가 없을 때 — 모바일은 손잡이만, 데스크탑은 위 여백만 남는다. */
export const headBare = style(
  inComponentsLayer({
    paddingBottom: 6,
    '@media': { [media.desktop]: { paddingBottom: 0 } },
  }),
)

export const handle = style(
  inComponentsLayer({
    alignSelf: 'center',
    display: 'block',
    width: 36,
    height: 4,
    borderRadius: vars.shape.radiusPill,
    background: vars.color.textTertiary,
    opacity: 0.5,
    '@media': { [media.desktop]: { display: 'none' } },
  }),
)

/** 내용 — 길면 여기만 구른다. 끝에서 뒤 페이지가 따라 밀리지 않게 막는다. */
export const content = style(
  inComponentsLayer({
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '0 20px 16px',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    '@media': {
      [media.desktop]: {
        padding: '0 28px 16px',
        selectors: { '&:last-child': { paddingBottom: 28 } },
      },
    },
    selectors: {
      '&:last-child': { paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' },
    },
  }),
)

/** 아래 — 늘 보이는 주 행동. 위 선으로 내용과 가른다. */
export const footer = style(
  inComponentsLayer({
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
    borderTop: `1px solid ${vars.color.lineDivider}`,
    '@media': { [media.desktop]: { padding: '16px 28px 28px' } },
  }),
)
