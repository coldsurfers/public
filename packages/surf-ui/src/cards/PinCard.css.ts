import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { lineClamp } from '../css/style-utils'

/**
 * 핀 한 장 — Figma `1455:263`. 포스터 원래 비율 · 아래 제목 두 줄 · 출처 한 줄.
 * @remarks `inline-block` 인 이유: 다단(`column-count`) 그리드에서 `break-inside: avoid` 를 쓰면 iOS Safari 가 열 높이를 크게 잡아 덩이 밑에 빈자리를 남긴다.
 */
export const root = style(
  inComponentsLayer({
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    verticalAlign: 'top',
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
    aspectRatio: 'auto 3 / 4',
    borderRadius: vars.shape.radiusPoster,
    background: vars.color.bgAlt,
    selectors: { [`${root}:hover &`]: { filter: 'brightness(0.88)' } },
  }),
)

export const posterEmpty = style([
  poster,
  inComponentsLayer({
    aspectRatio: '3 / 4',
    display: 'grid',
    placeItems: 'center',
    padding: 16,
    fontWeight: vars.fontWeight.bold,
    textAlign: 'center',
  }),
])

/** 마우스가 있는 기기에선 hover · 포커스 때만 보인다. */
export const action = style(
  inComponentsLayer({
    position: 'absolute',
    right: 8,
    bottom: 8,
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
    paddingInline: 4,
    marginTop: 8,
    fontSize: 14,
    fontWeight: vars.fontWeight.bold,
    lineHeight: 1.35,
    color: vars.color.textPrimary,
    ...lineClamp(2),
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
    marginTop: 2,
    paddingInline: 4,
    fontSize: 12,
    color: vars.color.textSecondary,
  }),
)
