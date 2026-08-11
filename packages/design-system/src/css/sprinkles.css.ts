import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles'
import { vars } from './contract.css'
import { utilitiesLayer } from './layers'
import { media } from './media'

/**
 * 원자 유틸 — Tailwind 자리를 대체한다.
 *
 * **`ds-utilities` 레이어에 들어간다.** `LAYER_ORDER` 상 `ds-components` 보다 뒤라, 호출자가
 * 넘긴 유틸이 컴포넌트 기본값을 **상세도·소스 순서와 무관하게 항상 이긴다**. `className` prop 이
 * 먹는다는 약속이 운이 아니라 캐스케이드로 보장되는 자리.
 *
 * ─── 무엇을 넣고 무엇을 뺐나 (2026-08-04 실측 근거) ───
 *
 * 표는 취향이 아니라 `apps/web-next` 의 반응형 접두(`sm:`·`tablet:` 등) 실사용 집계로 정했다.
 * 넣지 않은 축은 아래 _반응형 밖_ 에 이유와 함께 남긴다 — 나중에 "왜 없지"를 다시 묻지 않도록.
 *
 * **색은 반응형 축이 아니다.** 반응형 `text-*` 190건 중 188건이 폰트 *크기*였고(색 0건),
 * 반응형 색 유틸(`bg-`·`border-`·`fill-`·`stroke-`)은 앱 전체에 **8건**뿐이다. 그래서 색·굵기·
 * radius 는 조건 없는 표로 분리했다 — 조건을 붙이면 클래스 수가 3배가 되는데 살 사람이 없다.
 */

/**
 * 반응형 조건 축. **`mobile` 은 미디어 쿼리가 없다.**
 *
 * `media.mobile`(min-width: 480px)을 넣으면 480px 미만에서 아무 스타일도 안 붙는다 —
 * mobile-first 의 base 는 무조건이어야 한다. 그래서 `media` 3종 중 sprinkles 가 쓰는 건
 * `tablet`·`desktop` 둘뿐이고, `media.mobile` 은 `style()` 쪽 전용으로 남는다.
 *
 * 축은 토큰 `breakpoints`(mobile 480 · tablet 768 · desktop 1024) 하나로 통일했다.
 * Tailwind 기본 `sm:`(640px)을 쓰던 자리는 768 로 밀리며 시각이 바뀐다 — 의도된 대가다.
 */
const conditions = {
  mobile: {},
  tablet: { '@media': media.tablet },
  desktop: { '@media': media.desktop },
} as const

/**
 * 반응형으로 여는 축. 컷 기준은 **web-next 반응형 실사용 10건 이상**:
 * fontSize 188 · padding 160 · gap 85 · display 42 · flexDirection(33 중) ·
 * alignItems 19 · margin 16 · justifyContent 14.
 */
const responsiveProperties = defineProperties({
  '@layer': utilitiesLayer,
  conditions,
  defaultCondition: 'mobile',
  properties: {
    display: ['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid'],
    flexDirection: ['row', 'column'],
    alignItems: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'],
    justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
    gap: vars.space,
    columnGap: vars.space,
    rowGap: vars.space,
    paddingTop: vars.space,
    paddingRight: vars.space,
    paddingBottom: vars.space,
    paddingLeft: vars.space,
    marginTop: vars.space,
    marginRight: vars.space,
    marginBottom: vars.space,
    marginLeft: vars.space,
    fontSize: vars.fontSize,
  },
  shorthands: {
    padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
    margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
    marginX: ['marginLeft', 'marginRight'],
    marginY: ['marginTop', 'marginBottom'],
  },
})

/**
 * 조건 없는 축 — 위 _색은 반응형 축이 아니다_ 참조.
 *
 * 값은 전부 contract 를 통하므로 **토큰 밖의 색·radius 는 타입 에러**다. 규율의 강제 주체가
 * 감사 스크립트가 아니라 `tsc` 가 되는 지점이 유틸 축에도 생긴다.
 */
const staticProperties = defineProperties({
  '@layer': utilitiesLayer,
  properties: {
    color: vars.color,
    background: { ...vars.color, ...vars.cover, ...vars.paper },
    borderColor: vars.color,
    borderRadius: vars.radius,
    fontFamily: vars.font,
    fontWeight: vars.fontWeight,
    lineHeight: vars.lineHeight,
  },
})

export const sprinkles = createSprinkles(responsiveProperties, staticProperties)
export type Sprinkles = Parameters<typeof sprinkles>[0]

/**
 * ─── 반응형 밖으로 둔 것 (실측은 있으나 축이 없다) ───
 *
 * | 축 | 반응형 실사용 | 왜 안 넣었나 |
 * | --- | --- | --- |
 * | `width`·`height`·`maxWidth` | 43·20·4 | **토큰 스케일이 없다.** 넣으려면 값을 지어내야 한다 |
 * | `gridTemplateColumns` | 60 | 같은 이유. 1~6 을 임의로 만드는 건 토큰이 아니다 |
 * | `letterSpacing` | 10 | 토큰 없음. `editorialType` 이 슬롯별로만 갖고 있다 |
 * | `inset`·`order`·`flexShrink` | 각 4~5 | 소수. 필요해질 때 실측으로 다시 판단 |
 *
 * 그리고 sprinkles 로는 **원리적으로** 안 되는 둘이 있다:
 * arbitrary 값(`text-[13px]` 류)과 `group-hover:` **63건**(2026-08-04 재측정. 이전 판의 232건은
 * 재현되지 않는다). 후자는 부모 상태를 읽는 셀렉터라 원자 유틸의 표현 밖이고,
 * `style({ selectors })` 로 내려간다 — 유틸 작업이 아니라 표면 작업이다.
 *
 * ⚠️ **한 속성은 한 레이어.** 조건(`:hover`·`@media`)이 이 표 밖이라 `style()` 로 내려가면
 * **base 값도 같이 내려가야 한다.** 여기 남기면 `ds-utilities` 가 `ds-components` 를 레이어로
 * 이겨서 그 조건이 통째로 죽는다 — 타입·감사·빌드가 전부 통과한 채로. 실측 사고 2건.
 */
