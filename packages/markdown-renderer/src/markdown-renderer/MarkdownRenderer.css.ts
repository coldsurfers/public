import { inComponentsLayer, media, vars } from '@coldsurfers/design-system'
import { style } from '@vanilla-extract/css'
// 부수효과 — 레이어 순서 선언이 이 스타일시트의 맨 앞에 실려야 한다. 근거는 `layers.css.ts`.
import '../layers.css'
import { alpha, lineClamp } from '@coldsurfers/design-system/style-utils'

/**
 * 마크다운 본문 스킨 + 리치 임베드(YouTube·Bandcamp·Spotify·coldsurf 티켓·OG 카드)의 스타일 계약.
 *
 * **소비 앱의 prose 스킨이 여전히 이긴다.** `web-next` 의 `.magazine-prose p`·
 * `.pick-detail-root .rd-body p` 는 무레이어 CSS 라, 여기 클래스가 `ds-components` 레이어에
 * 들어가도 캐스케이드 결과는 이관 전과 같다(무레이어 > 레이어).
 *
 * 치수 px 은 토큰 스케일에 없는 값이다 — `Button.css.ts` 와 같은 처리. 토큰 스케일 승격은
 * Phase 6 의 일이다.
 *
 * 정본 스펙: `specs/web-next/vanilla-extract-adoption.md` (확장 Phase 7)
 */

/** `transition-colors` 등가. 임베드 카드·링크가 공유한다. */
const colorTransition = {
  transitionProperty: 'color, background-color, border-color, text-decoration-color',
  transitionDuration: '150ms',
} as const

/* ── 공통 ─────────────────────────────────────────────────────────── */

/** 블록 임베드의 세로 리듬(`my-6`). 모든 임베드 래퍼가 공유한다. */
const blockGap = { marginBlock: 24 } as const

/** 임베드 데이터 미해소 시의 폴백 링크(=원본 URL 노출). */
export const fallbackLink = style(
  inComponentsLayer({
    color: vars.color.link,
    ...colorTransition,
    selectors: { '&:hover': { color: vars.color.linkHover } },
  }),
)

export const fallbackBlock = style(inComponentsLayer(blockGap))

/* ── coldsurf 티켓 임베드 ─────────────────────────────────────────── */

export const ticketCard = style(
  inComponentsLayer({
    ...blockGap,
    border: `1px solid ${vars.color.border}`,
    borderRadius: vars.radius.sm,
    overflow: 'hidden',
  }),
)

export const ticketHead = style(inComponentsLayer({ display: 'flex', gap: 16, padding: 16 }))

export const ticketPoster = style(
  inComponentsLayer({
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: vars.radius.sm,
    flexShrink: 0,
  }),
)

export const ticketMeta = style(inComponentsLayer({ minWidth: 0, flex: 1 }))

export const ticketDate = style(
  inComponentsLayer({
    fontSize: vars.fontSize['3xs'],
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: vars.color.muted,
    marginBottom: 4,
  }),
)

export const ticketTitle = style(
  inComponentsLayer({
    color: vars.color.heading,
    fontWeight: vars.fontWeight.semibold,
    lineHeight: vars.lineHeight.snug,
  }),
)

export const ticketVenue = style(
  inComponentsLayer({ color: vars.color.body, fontSize: vars.fontSize.sm, marginTop: 2 }),
)

/** 출처 브랜딩 — Bandcamp 의 'bc', Spotify 로고 자리. */
export const ticketBrand = style(
  inComponentsLayer({
    flexShrink: 0,
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: vars.fontSize['3xs'],
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: vars.color.muted,
    ...colorTransition,
    selectors: { '&:hover': { color: vars.color.link } },
  }),
)

/**
 * `◖` 글리프. 13px 은 토큰 스케일에 없다(xs 12 · sm 14 의 정확한 중간) — 스냅 방향은
 * 스펙의 **열린 결정 16** 이라 리터럴로 남긴다. 타이포 단계가 아니라 글리프 광학 크기다.
 */
export const ticketBrandGlyph = style(
  inComponentsLayer({ fontSize: 13, lineHeight: '1', fontWeight: vars.fontWeight.semibold }),
)

export const ticketList = style(inComponentsLayer({ borderTop: `1px solid ${vars.color.border}` }))

export const ticketRow = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingInline: 16,
    paddingBlock: 12,
    borderBottom: `1px solid ${vars.color.border}`,
    ...colorTransition,
    selectors: {
      '&:last-child': { borderBottom: 'none' },
      '&:hover': { background: vars.color.surfaceHover },
    },
  }),
)

export const ticketSeller = style(
  inComponentsLayer({
    color: vars.color.body,
    fontWeight: vars.fontWeight.medium,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
)

export const ticketOpenDate = style(
  inComponentsLayer({
    fontSize: vars.fontSize.xs,
    color: vars.color.muted,
    whiteSpace: 'nowrap',
  }),
)

export const ticketSource = style(
  inComponentsLayer({
    paddingInline: 16,
    paddingBlock: 8,
    fontSize: vars.fontSize['2xs'],
    color: vars.color.muted,
    borderTop: `1px solid ${vars.color.border}`,
  }),
)

/* ── Bandcamp · Spotify · YouTube ─────────────────────────────────── */

export const bandcampBlock = style(
  inComponentsLayer({ ...blockGap, display: 'flex', justifyContent: 'center' }),
)

export const bandcampFrame = style(inComponentsLayer({ maxWidth: '100%', border: 'none' }))

export const spotifyBlock = style(inComponentsLayer(blockGap))

export const spotifyFrame = style(
  inComponentsLayer({ border: 'none', borderRadius: vars.radius.xl }),
)

/** `padding-top: 56.25%` 는 16:9(9/16) 비율 박스를 만드는 고전 트릭. */
export const youTubeBlock = style(
  inComponentsLayer({
    ...blockGap,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    paddingTop: '56.25%',
  }),
)

export const youTubeFrame = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    height: '100%',
    width: '100%',
    border: 'none',
  }),
)

/* ── OG 링크 카드 ─────────────────────────────────────────────────── */

export const ogCard = style(
  inComponentsLayer({
    ...blockGap,
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    border: `1px solid ${vars.color.border}`,
    textDecoration: 'none',
    ...colorTransition,
    selectors: { '&:hover': { background: vars.color.surface2 } },
  }),
)

export const ogBody = style(
  inComponentsLayer({
    flex: 1,
    minWidth: 0,
    paddingInline: 16,
    paddingBlock: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 8,
  }),
)

export const ogText = style(
  inComponentsLayer({ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }),
)

/** Tailwind `group-hover:` 등가 — 부모 카드 hover 를 선택자로 참조한다. */
export const ogTitle = style(
  inComponentsLayer({
    color: vars.color.strong,
    fontWeight: vars.fontWeight.medium,
    fontSize: vars.fontSize.sm,
    lineHeight: vars.lineHeight.snug,
    ...lineClamp(2),
    ...colorTransition,
    selectors: { [`${ogCard}:hover &`]: { color: vars.color.link } },
  }),
)

export const ogDescription = style(
  inComponentsLayer({
    color: vars.color.muted,
    fontSize: vars.fontSize.xs,
    lineHeight: vars.lineHeight.relaxed,
    ...lineClamp(2),
  }),
)

export const ogSite = style(
  inComponentsLayer({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    color: vars.color.faint,
    fontSize: vars.fontSize.xs,
  }),
)

export const ogFavicon = style(
  inComponentsLayer({ height: 14, width: 14, flexShrink: 0, margin: 0 }),
)

export const ogHost = style(
  inComponentsLayer({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
)

/**
 * 썸네일 박스. 원래 Tailwind `hidden sm:block`(640px)이었고 토큰 축 `tablet`(768px)으로 접었다 —
 * **640~768px 구간에서 썸네일이 안 보인다.** 결정 9·10 이 허용한 의도된 변화(`ChatPanel` 과 동일).
 */
export const ogThumb = style(
  inComponentsLayer({
    display: 'none',
    width: 128,
    flexShrink: 0,
    background: vars.color.surface2,
    '@media': { [media.tablet]: { display: 'block' } },
  }),
)

export const ogThumbImage = style(
  inComponentsLayer({ height: '100%', width: '100%', objectFit: 'cover', margin: 0 }),
)

/* ── 마크다운 요소 ────────────────────────────────────────────────── */

/** `text-3xl sm:text-4xl` → 토큰 축 `tablet`. 위 `ogThumb` 과 같은 경계값 이동. */
export const h1 = style(
  inComponentsLayer({
    fontSize: vars.fontSize['3xl'],
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.heading,
    lineHeight: vars.lineHeight.tight,
    marginBottom: 32,
    '@media': { [media.tablet]: { fontSize: vars.fontSize['4xl'] } },
  }),
)

export const h2 = style(
  inComponentsLayer({
    fontSize: vars.fontSize.xl,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.heading,
    marginTop: 48,
    marginBottom: 16,
  }),
)

export const h3 = style(
  inComponentsLayer({
    fontSize: vars.fontSize.base,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.strong,
    marginTop: 32,
    marginBottom: 12,
  }),
)

export const paragraph = style(
  inComponentsLayer({
    color: vars.color.body,
    fontSize: vars.fontSize.base,
    lineHeight: vars.lineHeight.relaxed,
    marginBottom: 20,
  }),
)

/**
 * `font-style` 을 적지 않는다. 이관 전에도 web-next 의 전역 가드
 * (`styles.css` 의 `.italic { font-style: normal }` — 한글은 진짜 이탤릭이 없어 fake-oblique 로
 * 떨어진다)가 이 자리의 `italic` 을 죽이고 있었다. 클래스가 사라지면 그 가드도 안 걸리므로,
 * 렌더 결과를 보존하려면 여기서 기울이지 않는 게 맞다.
 */
export const blockquote = style(
  inComponentsLayer({
    borderLeft: `2px solid ${vars.color.border}`,
    paddingLeft: 16,
    marginBlock: 24,
    color: vars.color.blockquote,
  }),
)

/** 인라인 코드만. 블록 코드는 Shiki 가 이미 토큰 스타일을 인라인으로 박아둔다. */
export const inlineCode = style(
  inComponentsLayer({
    background: vars.color.codeBg,
    paddingBlock: 2,
    fontSize: vars.fontSize.sm,
    color: vars.color.codeFg,
    fontFamily: vars.font.mono,
  }),
)

export const pre = style(
  inComponentsLayer({
    marginBlock: 24,
    padding: 16,
    fontSize: vars.fontSize.sm,
    fontFamily: vars.font.mono,
    lineHeight: vars.lineHeight.relaxed,
    overflowX: 'auto',
    border: `1px solid ${vars.color.border}`,
  }),
)

/** Tailwind preflight 의 `hr` 기본값(`border-top-width: 1px`)에 기대지 않고 명시한다. */
export const hr = style(
  inComponentsLayer({
    border: 'none',
    borderTop: `1px solid ${vars.color.border}`,
    marginBlock: 40,
  }),
)

const listBase = {
  color: vars.color.body,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.normal,
  marginBottom: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
} as const

export const ul = style(inComponentsLayer({ ...listBase, listStyleType: 'none' }))

export const ol = style(
  inComponentsLayer({ ...listBase, listStyleType: 'decimal', listStylePosition: 'inside' }),
)

/** 불릿을 `—` 로 갈음한다. `ul` 의 `list-style: none` 과 짝. */
export const li = style(
  inComponentsLayer({
    position: 'relative',
    paddingLeft: 24,
    '::before': {
      content: '—',
      position: 'absolute',
      left: 0,
      top: 0,
      color: vars.color.faint,
    },
  }),
)

/**
 * `--link` 토큰이 본문 텍스트 색과 (다크에선 동일하게) 거의 같게 잡혀 있어서, 색만으로는
 * hover 전까지 링크인지 분간이 안 된다. 색 결정은 그대로 두되 *항상 보이는 옅은 밑줄* 로
 * 링크 affordance 를 준다(색에만 의존하지 않음 — WCAG). hover 시 본래의 빨강 강세로 전환.
 */
export const link = style(
  inComponentsLayer({
    color: vars.color.link,
    textDecorationLine: 'underline',
    textDecorationThickness: 1,
    textDecorationColor: alpha(vars.color.link, 40),
    textUnderlineOffset: 2,
    ...colorTransition,
    selectors: {
      '&:hover': {
        color: vars.color.linkHover,
        textDecorationColor: vars.color.linkHover,
      },
    },
  }),
)

export const strong = style(
  inComponentsLayer({ color: vars.color.strong, fontWeight: vars.fontWeight.semibold }),
)

export const image = style(
  inComponentsLayer({
    marginBlock: 24,
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    marginInline: 'auto',
  }),
)

export const tableScroll = style(inComponentsLayer({ overflowX: 'auto', marginBlock: 24 }))

export const table = style(
  inComponentsLayer({
    width: '100%',
    border: `1px solid ${vars.color.border}`,
    fontSize: vars.fontSize.sm,
  }),
)

export const thead = style(inComponentsLayer({ background: vars.color.surface2 }))

export const th = style(
  inComponentsLayer({
    textAlign: 'left',
    paddingInline: 16,
    paddingBlock: 8,
    color: vars.color.subtle,
    fontWeight: vars.fontWeight.medium,
    borderBottom: `1px solid ${vars.color.border}`,
  }),
)

export const td = style(
  inComponentsLayer({
    paddingInline: 16,
    paddingBlock: 8,
    color: vars.color.muted,
    borderBottom: `1px solid ${vars.color.borderSoft}`,
  }),
)
