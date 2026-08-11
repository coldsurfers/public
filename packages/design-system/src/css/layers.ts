/**
 * 레이어 **이름과 순서**의 TS 측 SSOT.
 *
 * 이 순서를 실제 CSS 로 발행하는 건 `layers.css.ts` 다.
 * 한 줄로 줄이면: Tailwind preflight(`@layer base`)가 컴포넌트 스타일을 이기면 padding·border 가
 * 전부 지워지므로 `base` 는 `ds-components` 보다 **앞**이어야 하고, 호출자가 넘긴 유틸이
 * 컴포넌트를 덮어야 하므로 `utilities` 는 **뒤**여야 한다.
 */

/** 엘리먼트 기본값. 무엇에든 져야 하므로 가장 약하다. */
export const resetLayer = 'ds-reset'

/** 토큰·테마 수준 전역 선언. reset 은 이기고 컴포넌트에는 진다. */
export const tokensLayer = 'ds-tokens'

/** 컴포넌트 스타일 — `.css.ts` 의 `style()` 대부분이 여기 속한다. */
export const componentsLayer = 'ds-components'

/** 원자 유틸 — 컴포넌트 스타일을 이겨야 override 로 쓸 수 있으므로 가장 강하다. */
export const utilitiesLayer = 'ds-utilities'

/**
 * 전체 캐스케이드 순서. `properties`·`theme`·`base`·`components`·`utilities` 는 **Tailwind 가
 * 발행하는 레이어 이름**이다 — Tailwind 와 함께 쓰는 소비자를 위해 자리를 잡아준다. 특히
 * `base`(preflight)가 `ds-components` 보다 앞이어야 컴포넌트의 padding·border 가 안 지워진다.
 *
 * Tailwind 를 안 쓰면 그 넷은 아무것도 안 붙은 빈 레이어라 무해하다. 그래서 소비자별로
 * 갈리게 두지 않고 한 순서로 고정한다 — 순서가 갈리면 그건 계약이 아니다.
 */
export const LAYER_ORDER = [
  'properties',
  'theme',
  'base',
  resetLayer,
  tokensLayer,
  componentsLayer,
  'components',
  utilitiesLayer,
  'utilities',
] as const
