import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { CONCERT_CARD_BARE_SPEC as bare } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { alpha, lineClamp } from '../css/style-utils'

/**
 * 공연 카드 — 섀시 두 벌(`framed`·`bare`).
 *
 * 두 벌은 커버 비율부터 텍스트 스케일까지 공유하는 게 거의 없어서, 한 recipe 의 variant 로 묶는
 * 대신 **슬롯별로 나눠 export** 한다. 묶으면 `base` 가 사실상 비고 variant 가 전부를 다시
 * 선언하게 되는데, 그건 recipe 가 아니라 두 스타일을 한 이름에 욱여넣은 것이다.
 */

/* ── bare — 시안 dice.fm 리스킨(931:32·931:259). 섀시 없이 4:3 포스터 + 3줄 텍스트 ──
 *
 * 치수는 `contract/concert-card.ts` 의 `CONCERT_CARD_BARE_SPEC` 이 정본이다 — native 구현이
 * 같은 표를 읽으므로 여기 숫자를 손으로 고치면 두 레인이 갈린다.
 *
 * `@media(tablet)` 값만 리터럴로 남는다. RN 엔 미디어 쿼리가 없어 **갈라질 짝이 없고**,
 * 짝이 없으면 계약이 아니다(`contract/index.ts` 불변식).
 */

export const bareRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: bare.gap,
    '@media': { [media.tablet]: { gap: 13 } },
  }),
)

export const bareCover = style(
  inComponentsLayer({
    position: 'relative',
    aspectRatio: bare.coverAspectRatio,
    width: '100%',
    borderRadius: bare.coverRadius,
  }),
)

/** 포스터가 없을 때의 대형 이니셜 — 색면 위에 아주 옅게. */
export const bareInitial = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: bare.titleFontWeight,
    fontSize: bare.initialFontSize,
    lineHeight: 1,
    color: alpha(vars.paper.warm, bare.initialOpacity * 100),
    '@media': { [media.tablet]: { fontSize: 76 } },
  }),
)

export const bareCoverAction = style(
  inComponentsLayer({
    position: 'absolute',
    right: bare.coverActionInset,
    bottom: bare.coverActionInset,
    '@media': { [media.tablet]: { right: 12, bottom: 12 } },
  }),
)

export const bareMeta = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: bare.metaGap,
    '@media': { [media.tablet]: { gap: 3 } },
  }),
)

/**
 * 제목은 항상 2줄에서 자르고, 2줄 *예약*은 `reserve` 로 켠다.
 * `leading` 을 px 로 못박은 덕에 minHeight(2줄 = 2×leading)가 정확히 맞아떨어진다.
 */
export const bareTitle = recipe({
  base: inComponentsLayer({
    ...lineClamp(bare.titleLines),
    fontWeight: bare.titleFontWeight,
    fontSize: bare.titleFontSize,
    lineHeight: `${bare.titleLineHeight}px`,
    color: vars.color.strong,
    '@media': { [media.tablet]: { fontSize: 16, lineHeight: '23px' } },
  }),

  variants: {
    reserve: {
      true: inComponentsLayer({
        minHeight: bare.titleReservedHeight,
        '@media': { [media.tablet]: { minHeight: 46 } },
      }),
      false: {},
    },
  },

  defaultVariants: { reserve: false },
})

export const bareLine = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontSize: bare.metaFontSize,
    lineHeight: `${bare.metaLineHeight}px`,
    color: vars.color.text,
    '@media': { [media.tablet]: { fontSize: 15, lineHeight: '23px' } },
  }),
)

/* ── cover — 시안 날짜 피드 리스킨(1093:171 데스크탑 · 1093:576 모바일).
      섀시 없이 세로 커버 한 장 + 그 위 오버레이 텍스트, 커버 아래 메타 1줄 ── */

export const coverRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    '@media': { [media.tablet]: { gap: 16 } },
  }),
)

/**
 * 커버가 곧 카드다 — 위(eyebrow·담기)와 아래(제목)를 `space-between` 으로 밀어 붙인다.
 *
 * 시안의 제목 하단 여백은 32 인데 여기선 padding 과 같은 20/24 다. 시안엔 제목 아래 부제
 * (`단독공연 : SxWxCxL`)가 한 줄 더 있었고 그 슬롯을 실데이터가 못 채워 뺐다 — 남은 한 줄을
 * 부제 자리까지 내리면 아래가 허전해진다.
 */
export const coverCover = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    height: 430,
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: vars.radius.xl,
    padding: 20,
    '@media': { [media.tablet]: { height: 500, padding: 24 } },
  }),
)

/** 커버 하단 그라디언트 — 포스터가 밝아도 제목이 읽힌다. */
export const coverScrim = style(
  inComponentsLayer({
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 210,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.62))',
    '@media': { [media.tablet]: { height: 240 } },
  }),
)

/** eyebrow(좌) · 담기(우). `flex-start` 라 11px 텍스트가 42px 버튼에 눌리지 않는다. */
export const coverTopRow = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  }),
)

export const coverEyebrow = style(
  inComponentsLayer({
    fontFamily: vars.font.mono,
    fontSize: 11,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: alpha(vars.paper.warm, 90),
  }),
)

export const coverTitle = style(
  inComponentsLayer({
    ...lineClamp(2),
    position: 'relative',
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: '-0.4px',
    lineHeight: 1.25,
    color: vars.paper.warm,
    '@media': { [media.tablet]: { fontSize: 30, letterSpacing: '-0.5px' } },
  }),
)

export const coverMeta = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontSize: 13,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.1px',
    color: vars.color.muted,
  }),
)

/* ── framed — 테두리·배경 있는 액자 카드(/live-events·/nearby·/gig-guide) ── */

export const framedRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 16,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
  }),
)

export const framedCover = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    height: 190,
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
  }),
)

/** 커버를 채우는 실제 포스터. */
export const coverImage = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
)

export const framedMatch = style(
  inComponentsLayer({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    fontSize: vars.fontSize.xs,
    color: alpha('white', 90),
  }),
)

export const framedMatchDot = style(
  inComponentsLayer({
    width: 6,
    height: 6,
    borderRadius: vars.radius.full,
    background: 'currentColor',
  }),
)

export const framedInitial = style(
  inComponentsLayer({
    position: 'relative',
    fontFamily: vars.font.serif,
    fontSize: vars.fontSize['5xl'],
    lineHeight: 1,
    color: alpha('white', 85),
  }),
)

export const framedCoverAction = style(
  inComponentsLayer({ position: 'absolute', right: 12, bottom: 12 }),
)

export const framedBody = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '14px 16px 16px',
  }),
)

/** 1줄 제목도 2줄 높이를 차지하게 예약 — 카드 높이가 고르다. */
export const framedTitle = style(
  inComponentsLayer({
    ...lineClamp(2),
    minHeight: '2.7em',
    fontSize: 17,
    fontWeight: vars.fontWeight.semibold,
    lineHeight: 1.35,
    color: vars.color.strong,
  }),
)

export const framedMeta = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontSize: 13,
    color: vars.color.muted,
  }),
)
