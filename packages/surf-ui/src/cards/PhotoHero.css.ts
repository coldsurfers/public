import { globalStyle, style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { componentsLayer } from '../css/layers'
import { alpha } from '../css/style-utils'
import { breakpoints } from '../tokens'

/**
 * 사진 히어로 — Figma `831:2` · `838:2` 첫 화면. 바닥은 사진, 그 위 스크림, 그 위 두 칸.
 *
 * 두 칸으로 접는 기준은 뷰포트가 아니라 **자기 폭**이다(컨테이너 쿼리) — 좁은 칸에 놓이면
 * 데스크탑 화면에서도 쌓인다. 미디어 쿼리면 워드마크가 결정 칸 밑으로 깔린다.
 */
const wide = `(min-width: ${breakpoints.desktop})`

export const root = style(
  inComponentsLayer({
    position: 'relative',
    isolation: 'isolate',
    containerType: 'inline-size',
    overflow: 'hidden',
    background: `linear-gradient(160deg, ${vars.color.bgAlt}, ${vars.color.bgBase})`,
    color: vars.color.textPrimary,
    fontFamily: vars.font.sans,
  }),
)

/** 사진이 없을 때 서는 번짐 — 빈 바닥이 평평하지 않게. */
export const glow = style(
  inComponentsLayer({
    position: 'absolute',
    zIndex: -2,
    top: '-10%',
    right: '-10%',
    width: '70%',
    height: '80%',
    borderRadius: '50%',
    background: vars.color.glow,
    filter: 'blur(140px)',
  }),
)

export const photo = style(
  inComponentsLayer({
    position: 'absolute',
    zIndex: -2,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)

/** 스크림 — 모바일 세로(아래로 짙게), 데스크탑 가로(글자 칸 · 결정 칸을 읽히게). */
export const scrim = style(
  inComponentsLayer({
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    background: `linear-gradient(180deg, ${alpha(vars.color.overlay, 35)} 0%, ${alpha(vars.color.overlay, 30)} 40%, ${alpha(vars.color.overlay, 70)} 55%, ${alpha(vars.color.overlay, 92)} 100%)`,
    '@container': {
      [wide]: {
        background: `linear-gradient(90deg, ${alpha(vars.color.overlay, 82)} 0%, ${alpha(vars.color.overlay, 25)} 45%, ${alpha(vars.color.overlay, 35)} 62%, ${alpha(vars.color.overlay, 75)} 100%)`,
      },
    },
  }),
)

export const inner = style(
  inComponentsLayer({
    display: 'grid',
    gap: vars.layout.heroColumnGap,
    boxSizing: 'content-box',
    maxWidth: vars.layout.contentWidth,
    margin: '0 auto',
    padding: `24px ${vars.layout.gutter} 40px`,
    '@container': {
      [wide]: {
        gridTemplateColumns: `minmax(0, 1fr) ${vars.layout.heroDecisionWidth}`,
        alignItems: 'center',
        padding: `40px ${vars.layout.gutter} 80px`,
      },
    },
  }),
)

export const brand = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 24,
    minWidth: 0,
    '@container': { [wide]: { minHeight: vars.layout.heroPosterHeight } },
  }),
)

export const middle = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 14 }),
)

/** 워드마크 — 문자열이면 임시 글자, SVG 면 폭만 정한다. */
export const wordmark = style(
  inComponentsLayer({
    margin: 0,
    fontSize: 'min(54px, 14cqi)',
    fontWeight: vars.fontWeight.black,
    lineHeight: 1,
    letterSpacing: '-0.03em',
    color: vars.color.textOnMedia,
    '@container': { [wide]: { fontSize: 'min(116px, 8cqi)' } },
  }),
)

globalStyle(`${wordmark} > svg, ${wordmark} > img`, {
  '@layer': {
    [componentsLayer]: { display: 'block', width: '100%', maxWidth: 653, height: 'auto' },
  },
})

export const copy = style(
  inComponentsLayer({
    margin: 0,
    fontFamily: vars.font.serif,
    fontSize: 22,
    fontWeight: vars.fontWeight.light,
    lineHeight: '34px',
    letterSpacing: '-0.01em',
    whiteSpace: 'pre-line',
    color: vars.color.textOnMedia,
    '@container': { [wide]: { fontSize: 32, lineHeight: '48px' } },
  }),
)

export const subcopy = style(
  inComponentsLayer({
    margin: 0,
    fontFamily: vars.font.geist,
    fontSize: 10,
    fontWeight: vars.fontWeight.medium,
    lineHeight: '16px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    whiteSpace: 'pre-line',
    color: alpha(vars.color.textPrimary, 70),
    '@container': { [wide]: { fontSize: vars.shape.typeKicker, lineHeight: '18px' } },
  }),
)

export const bottom = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 24,
  }),
)

export const script = style(inComponentsLayer({ minWidth: 0 }))

globalStyle(`${script} > svg, ${script} > img`, {
  '@layer': {
    [componentsLayer]: { display: 'block', width: '100%', maxWidth: 495, height: 'auto' },
  },
})

/** 결정 칸 — 바로 아래 패널을 유리로(패널색 72% · 뒤 흐림 24). */
export const aside = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minWidth: 0,
    vars: { [vars.color.panelFill]: alpha(vars.color.surfaceRaised, 72) },
  }),
)

globalStyle(`${aside} > section`, {
  '@layer': { [componentsLayer]: { backdropFilter: 'blur(24px)' } },
})
