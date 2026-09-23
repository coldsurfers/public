import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { CONCERT_CARD_BARE_SPEC as bare } from '../contract'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { skeletonToneValue } from '../primitives/Skeleton.css'

/**
 * `ConcertCard` 의 로딩 스켈레톤 — 섀시·치수를 실카드와 맞춰 로드 전후가 튀지 않게 한다.
 *
 * 값이 겹치는 건 의도다. **그래서 겹치는 값은 읽어온다** — 실카드가 읽는 표(`bare.*`)를 여기서도
 * 읽는다. 손으로 같은 숫자를 적어두면 spec 을 고쳤을 때 실카드만 따라오고 스켈레톤은 남아서,
 * 이 컴포넌트가 막으려던 바로 그 점프가 난다. 바탕색을 `skeletonToneValue` 에서 읽는 것과
 * 같은 수법이다.
 *
 * `@media(tablet)` 값만 리터럴로 남는다 — RN 엔 미디어 쿼리가 없어 갈릴 짝이 없다
 * (`ConcertCard.css.ts` 머리말과 같은 이유).
 */

/* ── bare ── */

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
    // `String()` 인 이유는 `ConcertCard.css.ts` 의 `bareCoverRatio` 위에 적혀 있다.
    aspectRatio: String(bare.coverAspectRatio.landscape),
    width: '100%',
    borderRadius: bare.coverRadius,
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

/** 바탕색은 `Skeleton` 과 같은 소스를 읽는다 — 같은 것을 그리는데 값이 갈리면 안 된다. */
const barBase = {
  borderRadius: vars.radius.md,
  background: skeletonToneValue.neutral,
} as const

/**
 * 첫 바 = 실카드의 제목 자리. 예약을 켰으면 2줄(42), 아니면 1줄(21) —
 * 로드 전후 높이가 안 튀도록 `reserve` 를 실카드와 **같은 값으로** 넘겨야 한다.
 *
 * 태블릿 갈래(46/23)는 실카드 `bareTitle` 에서 제목 확대가 걷히면서 같이 사라졌다. 여기 값이
 * 저쪽을 따라가는 게 아니라 **같은 상수를 읽는다** — 한쪽만 남으면 로드 순간 바가 튄다.
 */
export const titleBar = recipe({
  base: inComponentsLayer({ ...barBase, width: '100%' }),

  variants: {
    reserve: {
      true: inComponentsLayer({ height: bare.titleReservedHeight }),
      false: inComponentsLayer({ height: bare.titleLineHeight }),
    },
  },

  defaultVariants: { reserve: false },
})

export const lineBarShort = style(
  inComponentsLayer({
    ...barBase,
    height: 21,
    width: '40%',
    '@media': { [media.tablet]: { height: 23 } },
  }),
)

export const lineBarLong = style(
  inComponentsLayer({
    ...barBase,
    height: 21,
    width: '60%',
    '@media': { [media.tablet]: { height: 23 } },
  }),
)

/* ── cover ── */

/**
 * 커버 섀시의 껍데기·커버 블록은 **실카드의 것을 그대로 쓴다.**
 *
 * 머리말의 「겹치는 값은 읽어온다」를 이 자리에서만 안 지키고 있었다 — 430/500·radius 를 손으로
 * 옮겨 적어 뒀는데, 그 사이 실카드에 크기가 둘 더 붙어(`compact`·`large`) 스켈레톤만 `full`
 * 치수에 남았다. 이 컴포넌트가 막으려던 바로 그 점프가 났다.
 *
 * 값을 맞추는 대신 **같은 recipe 를 가리킨다.** 이러면 치수가 어긋날 자리가 아예 없다 —
 * 실카드에 크기가 또 붙어도 스켈레톤이 자동으로 따라온다.
 *
 * 빈 블록이라 recipe 가 함께 주는 `padding`·`flex` 는 겉보기에 영향이 없다(`box-sizing` 이
 * `border-box` 라 padding 이 높이 안에 든다).
 */
export { coverCover, coverRoot } from './ConcertCard.css'

export const coverBar = style(inComponentsLayer({ ...barBase, height: 16, width: '70%' }))

/* ── framed ── */

export const framedRoot = style(
  inComponentsLayer({
    display: 'flex',
    height: 280,
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: vars.radius.xl,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.surface,
  }),
)

export const framedCover = style(inComponentsLayer({ height: 176, flexShrink: 0 }))

export const framedBody = style(inComponentsLayer({ minHeight: 0, flex: 1, padding: 16 }))

export const framedBar1 = style(inComponentsLayer({ ...barBase, height: 16, width: '100%' }))

export const framedBar2 = style(
  inComponentsLayer({ ...barBase, height: 16, width: '60%', marginTop: 6 }),
)

export const framedBar3 = style(
  inComponentsLayer({ ...barBase, height: 14, width: '80%', marginTop: 12 }),
)
