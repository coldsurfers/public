import { style } from '@vanilla-extract/css'
import { PIN_CARD_SPEC as spec } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { lineClamp, pressable } from '../css/style-utils'

/**
 * 핀 한 장 — Figma `1455:263`. 포스터 원래 비율 · 아래 제목 두 줄 · 출처 한 줄.
 * 치수는 `contract/pin-card.ts` 의 `PIN_CARD_SPEC` — native `PinCard` 와 같은 표를 읽는다.
 * @remarks `inline-block` 인 이유: 다단(`column-count`) 그리드에서 `break-inside: avoid` 를 쓰면 iOS Safari 가 열 높이를 크게 잡아 덩이 밑에 빈자리를 남긴다.
 */
export const root = style(
  inComponentsLayer({
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    verticalAlign: 'top',
    transition: 'scale 150ms ease-out',
    ...pressable('large'),
  }),
)

/** ＋ 를 포스터 오른쪽 아래에 붙이는 기준. */
export const posterBox = style(inComponentsLayer({ position: 'relative', display: 'block' }))

/** 받기 전엔 3:4 회색 자리, 받으면 원래 비율 — 열이 덜컥 밀리지 않게 한다. */
export const poster = style(
  inComponentsLayer({
    display: 'block',
    width: '100%',
    height: 'auto',
    aspectRatio: `auto ${spec.posterFallbackRatio}`,
    borderRadius: vars.shape.radiusPoster,
    background: vars.color.bgAlt,
    selectors: { [`${root}:hover &`]: { filter: `brightness(${spec.pressedDim})` } },
  }),
)

export const posterEmpty = style([
  poster,
  inComponentsLayer({
    aspectRatio: `${spec.posterFallbackRatio}`,
    display: 'grid',
    placeItems: 'center',
    padding: spec.posterEmptyPadding,
    fontWeight: vars.fontWeight.bold,
    textAlign: 'center',
  }),
])

/** 마우스가 있는 기기에선 hover · 포커스 때만 보인다. */
export const action = style(
  inComponentsLayer({
    position: 'absolute',
    right: spec.actionInset,
    bottom: spec.actionInset,
    zIndex: 1,
    '@media': {
      '(hover: hover)': {
        opacity: 0,
        selectors: { [`${root}:hover &, ${root}:focus-within &`]: { opacity: 1 } },
      },
    },
  }),
)

export const title = style(
  inComponentsLayer({
    paddingInline: spec.captionInset,
    marginTop: spec.captionGap,
    fontSize: spec.titleFontSize,
    fontWeight: vars.fontWeight.bold,
    lineHeight: `${spec.titleLineHeight}px`,
    color: vars.color.textPrimary,
    ...lineClamp(spec.titleLines),
  }),
)

/** 링크 제목 — 카드 전체를 덮는다. ＋ 만 그 위에 뜬다. */
export const titleLink = style(
  inComponentsLayer({
    textDecoration: 'none',
    '::after': { content: '""', position: 'absolute', inset: 0 },
  }),
)

export const meta = style(
  inComponentsLayer({
    display: 'block',
    marginTop: spec.metaGap,
    paddingInline: spec.captionInset,
    fontSize: spec.metaFontSize,
    lineHeight: `${spec.metaLineHeight}px`,
    color: vars.color.textSecondary,
  }),
)
