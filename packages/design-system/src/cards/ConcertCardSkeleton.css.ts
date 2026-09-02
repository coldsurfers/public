import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'
import { skeletonToneValue } from '../primitives/Skeleton.css'

/**
 * `ConcertCard` 의 로딩 스켈레톤 — 섀시·치수를 실카드와 맞춰 로드 전후가 튀지 않게 한다.
 * 실카드가 바뀌면 여기도 같이 바뀌어야 한다는 뜻이라, 값이 겹치는 건 의도다.
 */

/* ── bare ── */

export const bareRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 11,
    '@media': { [media.tablet]: { gap: 13 } },
  }),
)

export const bareCover = style(
  inComponentsLayer({
    aspectRatio: '4 / 3',
    width: '100%',
    borderRadius: 8,
  }),
)

export const bareMeta = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    '@media': { [media.tablet]: { gap: 3 } },
  }),
)

/** 바탕색은 `Skeleton` 과 같은 소스를 읽는다 — 같은 것을 그리는데 값이 갈리면 안 된다. */
const barBase = {
  borderRadius: vars.radius.md,
  background: skeletonToneValue.neutral,
} as const

/**
 * 첫 바 = 실카드의 제목 자리. 예약을 켰으면 2줄(42/46), 아니면 1줄(21/23) —
 * 로드 전후 높이가 안 튀도록 `reserve` 를 실카드와 **같은 값으로** 넘겨야 한다.
 */
export const titleBar = recipe({
  base: inComponentsLayer({ ...barBase, width: '100%' }),

  variants: {
    reserve: {
      true: inComponentsLayer({ height: 42, '@media': { [media.tablet]: { height: 46 } } }),
      false: inComponentsLayer({ height: 21, '@media': { [media.tablet]: { height: 23 } } }),
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

export const coverRoot = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    '@media': { [media.tablet]: { gap: 16 } },
  }),
)

export const coverCover = style(
  inComponentsLayer({
    height: 430,
    borderRadius: vars.radius.xl,
    '@media': { [media.tablet]: { height: 500 } },
  }),
)

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
