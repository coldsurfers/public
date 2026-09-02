import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'
import { vars } from '../css/contract.css'
import { media } from '../css/media'

/**
 * 다크 풀블리드 밴드 — warm-paper 지면 유일하게 색이 뒤집히는 면.
 *
 * 가로축(`margin-inline:auto` · `max-width` · gutter)은 **여기 없다.** `Container` 가
 * 그 축의 정본이고 `PageBanner` 는 그 위에 세로 여백만 얹는다. 두 소비처가 그 값을 각자
 * 다시 선언하다 브레이크포인트가 갈렸던 게(tablet vs desktop) 이 컴포넌트의 발단이다
 * (coldsurfers/public#33 결정 4).
 *
 * `sprinkles` 를 쓰지 않는다 — 런타임 38 kB 를 `./layout` 소비자 전원에게 물릴 수 없다
 * (#19 D-7 · `Container.css.ts` 와 같은 판정).
 */

export const banner = style(inComponentsLayer({ background: vars.color.strong }))

/** 세로 여백만. 가로는 `Container` 가 든다. 64 → 72px, `Container` 와 같은 tablet 에서 갈린다. */
export const bannerShell = style(
  inComponentsLayer({
    paddingBlock: vars.space['16'],
    '@media': { [media.tablet]: { paddingBlock: '72px' } },
  }),
)

/**
 * 26 → 34px. 크기 스케일 밖이고(`2xl` 24 · `3xl` 30) `letterSpacing` 은 토큰 축 자체가 없다.
 *
 * 전경이 `paper.warm` 인 건 이 밴드가 어두운 바닥이기 때문이다 — `color.text` 를 쓰면
 * 라이트 표면 잉크가 그대로 와서 안 읽힌다.
 */
export const bannerTitle = style(
  inComponentsLayer({
    fontSize: '26px',
    fontWeight: 700,
    lineHeight: '1.32',
    letterSpacing: '-0.015em',
    color: vars.paper.warm,
    '@media': { [media.tablet]: { fontSize: '34px' } },
  }),
)

/** 15 → 16px. 15px 이 스케일 밖(`sm` 14 · `base` 16)이라 base 값까지 여기 있다. */
export const bannerBody = style(
  inComponentsLayer({
    fontSize: '15px',
    color: vars.color.subtle,
    '@media': { [media.tablet]: { fontSize: vars.fontSize.base } },
  }),
)
