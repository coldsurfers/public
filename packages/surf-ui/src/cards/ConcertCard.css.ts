import { style, styleVariants } from '@vanilla-extract/css'
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
    width: '100%',
    borderRadius: bare.coverRadius,
  }),
)

/**
 * 커버 비율 — `bareCover` 에서 **떼어낸** 축이다. 한 슬롯에 두면 비율을 바꾸는 소비처가
 * 클래스를 덮어써야 하고, 그건 상세도 다툼이 된다. 값은 `CONCERT_CARD_BARE_SPEC` 이 정본이고
 * native 는 같은 표를 `styled` 에서 읽는다.
 */
/**
 * ⚠️ **`String()` 이 필수다.** VE 는 숫자를 받으면 `px` 를 붙이는데 `aspect-ratio` 는 단위를
 * 못 받는 속성이라 `aspect-ratio: 1.333…px` 가 되고 **브라우저가 선언을 통째로 버린다.**
 * 빌드도 타입도 안 잡고 CSS 에 글자는 남아서, 산출물을 열어보기 전엔 안 보인다
 * (실측: `dist/styles.css` 에 `aspect-ratio:1.3333333333333333px` · `aspect-ratio:1px`).
 *
 * 표는 숫자로 둔다 — RN 은 `aspectRatio` 에 숫자를 그대로 먹는다(`native/ConcertCard.tsx`).
 * 단위 변환은 `tokens/native.ts` 의 `toPx` 와 같은 축이고, 여기서는 방향이 반대일 뿐이다.
 */
export const bareCoverRatio = styleVariants(bare.coverAspectRatio, (aspectRatio) =>
  inComponentsLayer({ aspectRatio: String(aspectRatio) }),
)

/**
 * 포스터가 없을 때의 대형 이니셜 — 면 위에 아주 옅게.
 *
 * 색을 직접 안 정한다. `CoverBlock` 이 톤으로 정한 `currentColor` 를 물고 투명도만 얹는다 —
 * 어두운 6톤에선 종이, `note` 에선 잉크가 되어 면이 밝아져도 글자가 따라 뒤집힌다.
 */
export const bareInitial = style(
  inComponentsLayer({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: bare.initialFontWeight,
    fontSize: bare.initialFontSize,
    lineHeight: 1,
    color: 'currentColor',
    opacity: bare.initialOpacity,
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
 *
 * ⚠️ **태블릿 확대(16/23)를 걷어냈다.** 스탬프 줄(`bareLine`)이 같은 이유로 먼저 걷힌 자리다 —
 * 카드 제목은 화면이 넓어졌다고 커지는 글이 아니고, 넓어진 건 칸이지 위계가 아니다. 시안
 * 라이브 목록(Page 16 ①)도 데스크톱에서 15 다. 걷어낸 덕에 웹과 native 가 **같은 숫자 하나**를
 * 쓴다(RN 엔 미디어 쿼리가 없어 저쪽은 처음부터 15 였다).
 */
export const bareTitle = recipe({
  base: inComponentsLayer({
    ...lineClamp(bare.titleLines),
    fontWeight: bare.titleFontWeight,
    fontSize: bare.titleFontSize,
    lineHeight: `${bare.titleLineHeight}px`,
    // `strong` 이 아니라 `text` 다 — 제목만 한 단 더 검으면 명도 사다리가 위에서 한 칸 비어
    // 보인다. 사다리 전체는 계약(`CONCERT_CARD_BARE_SPEC.titleFontWeight`) 주석에 적혀 있다.
    // `strong`(#05090f)은 표면에서 **가장 강한 전경** 자리라 목록 카드가 가져갈 값이 아니다.
    color: vars.color.text,
  }),

  variants: {
    // 예약 높이도 태블릿 갈래가 사라졌다 — 2 × `titleLineHeight` 라 한 값이면 충분하다.
    reserve: {
      true: inComponentsLayer({ minHeight: bare.titleReservedHeight }),
      false: {},
    },
  },

  defaultVariants: { reserve: false },
})

/**
 * 날짜 스탬프 — mono. 서체·크기·행간은 `CONCERT_CARD_BARE_SPEC` 이 정본이고, 자간만 여기서
 * 되돌린다: 본문 기본이 `-0.02em` 이라 고정폭 글리프가 뭉친다(`letterSpacing.none` 의 근거).
 */
export const bareLine = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontFamily: vars.font[bare.metaFontFamily],
    fontSize: bare.metaFontSize,
    lineHeight: `${bare.metaLineHeight}px`,
    letterSpacing: vars.letterSpacing.none,
    color: vars.color.muted,
  }),
)

/* ── cover — 시안 날짜 피드 리스킨(1093:171 데스크탑 · 1093:576 모바일).
      섀시 없이 세로 커버 한 장 + 그 위 오버레이 텍스트 ──
 *
 * 크기 축 둘(`size`) — 슬롯 셋(`coverCover`·`coverScrim`·`coverTitle`)이 같은 이름의 variant 로
 * 갈린다. 세 슬롯을 recipe 로 연 이유는 **`base` 가 비지 않기 때문**이다: 커버는 어느 크기든
 * `position:relative` + `space-between` 이고, 갈리는 건 높이·라운드·여백·타입뿐이다.
 * (`base` 가 비고 variant 가 전부를 다시 선언하면 그건 recipe 가 아니라 두 스타일을 한 이름에
 * 욱여넣은 것이다 — 파일 머리 주석.)
 *
 * - `full` — 날짜 피드(`/live-events/new`). 텍스트 둘만 커버에 얹고 **메타는 커버 밖** 1줄.
 *   하단 고정 높이 스크림이 제목만 받쳐준다.
 * - `compact` — 랜딩·그리드의 작은 칸. **셋 다 커버 안**(날짜 → 제목 → 공연장)이라 스크림이
 *   카드 전체 높이에 걸린다. 글이 커버 아래로 내려가지 않으므로 카드 높이가 곧 커버 높이다.
 */

export const coverRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    '@media': { [media.tablet]: { gap: 16 } },
  }),
)

/**
 * 커버가 곧 카드다 — 위(eyebrow·담기)와 아래(제목 or 텍스트 셋)를 `space-between` 으로 밀어
 * 붙인다. 위가 비어도 아래는 바닥을 지킨다.
 *
 * `full` 의 제목 하단 여백은 시안이 32 인데 여기선 padding 과 같은 20/24 다. 시안엔 제목 아래
 * 부제(`단독공연 : SxWxCxL`)가 한 줄 더 있었고 그 슬롯을 실데이터가 못 채워 뺐다 — 남은 한 줄을
 * 부제 자리까지 내리면 아래가 허전해진다.
 *
 * ⚠️ `compact` 의 290/300 은 **기본값이지 상한이 아니다.** 소비처 그리드는 같은 섀시로 더 큰
 * 칸(460/420 · 여백 24)도 쓰는데, 그건 축을 하나 더 여는 대신 `className` 으로 덮는다 —
 * 칸 크기는 그리드의 사정이지 카드의 축이 아니다.
 */
export const coverCover = recipe({
  base: inComponentsLayer({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  }),

  variants: {
    size: {
      full: inComponentsLayer({
        height: 430,
        borderRadius: vars.radius.xl,
        padding: 20,
        '@media': { [media.tablet]: { height: 500, padding: 24 } },
      }),
      compact: inComponentsLayer({
        height: 290,
        borderRadius: vars.radius['3xl'],
        padding: 18,
        '@media': { [media.tablet]: { height: 300 } },
      }),
      /**
       * `compact` 과 **같은 레이아웃, 더 큰 칸**이다 — 글은 똑같이 커버 안에 있고 치수만 다르다.
       *
       * 여는 자리 = **여러 열 그리드**. 칸이 420px 폭쯤 되는데 `compact` 높이(300)를 그대로
       * 쓰면 가로로 누운 칸에 세로 포스터가 들어가 상하단이 크게 잘린다. 높이를 키우면 칸이
       * 세로로 서서 포스터가 원래 비율에 가깝게 들어온다.
       */
      large: inComponentsLayer({
        height: 420,
        borderRadius: vars.radius['3xl'],
        padding: 24,
        '@media': { [media.tablet]: { height: 460 } },
      }),
    },
  },

  defaultVariants: { size: 'full' },
})

/**
 * 글이 커버 **안**에 있는 두 크기(`compact`·`large`)가 함께 쓰는 스크림 — 카드 전체 높이.
 *
 * 한 벌로 두는 이유는 값이 우연히 같아서가 아니라 **같아야 해서**다. 한쪽만 손보면 같은
 * 레이아웃의 두 칸이 서로 다른 밝기로 읽힌다.
 */
const insideScrim = {
  top: 0,
  background: `linear-gradient(180deg, ${alpha(vars.palette.deepNight, 0)} 0%, ${alpha(
    vars.palette.deepNight,
    72,
  )} 55%, ${alpha(vars.palette.deepNight, 92)} 100%)`,
} as const

/**
 * 커버 그라디언트 — 포스터가 밝아도 글이 읽힌다.
 *
 * `full` 은 **하단 고정 높이**(210/240)다. 받쳐줄 게 제목 한 줄뿐이라 위쪽까지 덮으면 포스터를
 * 필요 이상으로 어둡게 만든다. `compact` 는 **전체 높이**에 걸린다 — 날짜·제목·공연장 셋이
 * 커버 안에 있고 우상단 담기 버튼까지 얹히므로 덮을 면이 카드 전체다.
 */
export const coverScrim = recipe({
  base: inComponentsLayer({
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  }),

  variants: {
    size: {
      full: inComponentsLayer({
        height: 210,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.62))',
        '@media': { [media.tablet]: { height: 240 } },
      }),
      compact: inComponentsLayer(insideScrim),
      large: inComponentsLayer(insideScrim),
    },
  },

  defaultVariants: { size: 'full' },
})

/** eyebrow(좌) · 담기(우). `flex-start` 라 11px 텍스트가 42px 버튼에 눌리지 않는다. */
export const coverTopRow = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  }),
)

/**
 * 담기 슬롯을 우측으로 민다.
 *
 * `coverTopRow` 에 `space-between` 을 주면 **두 자리가 다 찼을 때만** 맞는다 — eyebrow 가
 * 없으면 담기가 왼쪽으로 붙으므로 자리를 채우는 빈 노드가 필요해진다. `auto` 여백은 이웃의
 * 유무를 묻지 않으므로 그 빈 노드가 사라진다. `compact` 가 eyebrow 없이도 담기를 우상단에
 * 두는 건 이 규칙을 그대로 물려받은 것이다.
 */
export const coverTopAction = style(inComponentsLayer({ marginInlineStart: 'auto' }))

export const coverEyebrow = style(
  inComponentsLayer({
    fontFamily: vars.font.sans,
    fontSize: 11,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: alpha(vars.paper.warm, 90),
  }),
)

/**
 * 글이 커버 안에 있는 두 크기가 함께 쓰는 제목 — `full` 보다 한 단 낮다.
 * 제목이 포스터를 가리지 않아야 해서고, 흰색은 이 크기에서 대비를 든다.
 */
const insideTitle = {
  fontSize: 17,
  lineHeight: '24px',
  color: vars.palette.white,
} as const

export const coverTitle = recipe({
  base: inComponentsLayer({
    ...lineClamp(2),
    position: 'relative',
    fontWeight: 700,
  }),

  variants: {
    size: {
      full: inComponentsLayer({
        fontSize: 26,
        letterSpacing: '-0.4px',
        lineHeight: 1.25,
        color: vars.paper.warm,
        '@media': { [media.tablet]: { fontSize: 30, letterSpacing: '-0.5px' } },
      }),
      compact: inComponentsLayer(insideTitle),
      /**
       * `large` 가 칸은 커도 제목은 `compact` 와 **같은 한 단**이다. 커지는 건 포스터가 보일
       * 면적이지 글의 몫이 아니다 — 여기서 제목까지 키우면 큰 칸일수록 포스터가 더 가려진다.
       */
      large: inComponentsLayer(insideTitle),
    },
  },

  defaultVariants: { size: 'full' },
})

/** `full` 전용 — 커버 **밖** 메타 1줄. */
export const coverMeta = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontSize: 13,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.1px',
    color: vars.color.muted,
  }),
)

/**
 * `compact` 전용 — 커버 안 하단에 앉는 텍스트 셋(날짜 · 제목 · 공연장).
 *
 * `position: relative` 가 필요하다 — 스크림이 `absolute` 라 배치되지 않은 형제 위에 얹힌다.
 * (`coverTitle` 이 `full` 에서 같은 이유로 `relative` 를 든다.)
 */
export const coverStack = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),
)

/**
 * `compact` 전용 날짜 스탬프 — mono.
 *
 * 서체가 갈리는 근거는 `bareLine` 과 같다: 날짜는 문장이 아니라 **수치**라, sans 로 쓰면 제목의
 * 작은 판처럼 읽힌다. 색만 다르다 — 잉크 위라 라이트 표면의 `muted` 가 안 먹고,
 * `ink.accent`(밴드 위 인디케이터 자리)가 그 자리다.
 */
export const coverStamp = style(
  inComponentsLayer({
    ...lineClamp(1),
    fontFamily: vars.font.mono,
    fontSize: 11,
    fontWeight: vars.fontWeight.medium,
    letterSpacing: '0.04em',
    color: vars.ink.accent,
  }),
)

/**
 * `compact` 전용 공연장 줄 — `footer` 슬롯이 들어앉는 자리.
 *
 * 내용물은 소비처가 주지만 **타입·색은 카드가 정한다.** 잉크 위 글자색을 소비처에 맡기면
 * 그 자리에서 `#c3cbd6` 이 손으로 다시 적힌다.
 */
export const coverVenue = style(
  inComponentsLayer({
    position: 'relative',
    fontSize: 13,
    lineHeight: '20px',
    color: vars.palette.haze,
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

/**
 * 커버 셸. **흐름에 서는 건 매치 라벨 하나뿐**이고, 나머지(이니셜·포스터·담기)는 전부 층이다.
 *
 * 예전엔 이니셜도 흐름에 서서 `marginTop: auto` 로 세로 배치를 만들었다. 그건 포스터가 이
 * 자리를 *대신* 채우던 시절의 모양이라, 바닥이 항상 깔리는 지금은 그 auto 여백이 라벨까지
 * 끌어내린다. 층을 층으로 두면 라벨은 포스터가 있든 없든 제자리(상단)에 선다.
 */
export const framedCover = style(
  inComponentsLayer({
    position: 'relative',
    display: 'flex',
    height: 190,
    flexShrink: 0,
    flexDirection: 'column',
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

/**
 * 커버 좌하단에 앉는다 — **흐름 밖**이다(`bareInitial` 과 같다).
 *
 * 예전엔 `marginTop: auto` 로 흐름 안에 있었는데, 그건 포스터가 이 자리를 *대신* 채울 때만
 * 성립했다. 이제 바닥은 포스터가 있든 없든 **항상** 깔리므로, 흐름에 두면 그 auto 여백이
 * 뒤따르는 매치 라벨까지 같이 끌어내린다. 층은 층으로 둔다 — 그래야 「매치 라벨과 이니셜은
 * 서로를 필요로 하지 않는다」가 말뿐이 아니라 실제로 참이 된다.
 *
 * `left`·`bottom` 은 커버의 `padding`(16)과 같은 값이다 — 흐름에 있던 시절의 자리를 그대로 딴다.
 *
 * 색·투명도는 `bareInitial` 과 **같은 규율**이다(면이 정한 `currentColor` + 워터마크 한 값).
 * 예전엔 흰색 85% 라 민짜 쪽(22%)보다 훨씬 짙었는데, 면이 `note` 로 밝아지면 그 값이 잉크
 * 85% 가 되어 워터마크가 아니라 드롭캡이 된다. 두 섀시가 같은 것을 그리므로 값도 하나다.
 */
export const framedInitial = style(
  inComponentsLayer({
    position: 'absolute',
    left: 16,
    bottom: 16,
    fontFamily: vars.font.serif,
    fontSize: vars.fontSize['5xl'],
    lineHeight: 1,
    color: 'currentColor',
    opacity: bare.initialOpacity,
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
