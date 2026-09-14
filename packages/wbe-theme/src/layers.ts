/**
 * 레이어 이름과 순서의 SSOT. 발행은 `layers.css.ts` 가 한다.
 *
 * `--wbe-` 네임스페이스와 같은 이유로 `wbe-` 접두를 쓴다 — design-system(`ds-*`)과
 * 한 화면에 실려도 서로의 순서를 흔들지 않는다.
 *
 * sprinkles 는 여기에 없다. **레이어 밖(unlayered)이 모든 레이어를 이기므로**,
 * 호출부가 넘긴 유틸이 컴포넌트 스타일을 덮는 자리는 레이어를 안 다는 쪽이 맞다.
 */

/** 엘리먼트 기본값. 무엇에든 져야 하므로 가장 약하다. */
export const resetLayer = 'wbe-reset'

/**
 * `:root` 토큰 값.
 *
 * 초안은 이 레이어를 두지 않았다 — "커스텀 프로퍼티는 캐스케이드 충돌이 없어 순서를
 * 다툴 일이 없다"고 봤기 때문이다. **틀렸다.** 소비처가 같은 변수를 같은 선택자에
 * 다시 선언하는 순간(반응형 재선언이 정확히 그 모양이다) 특이성이 같아져 *나중에
 * 로드된 쪽*이 이기고, 그 순서는 소비처 번들러가 정한다. 상세는 `theme.css.ts`.
 */
export const themeLayer = 'wbe-theme'

/** recipe·표면 스타일. */
export const componentsLayer = 'wbe-components'

/** 리셋 ← 토큰 ← 컴포넌트. `@coldsurfers/design-system` 의 `ds-*` 순서와 같은 축이다. */
export const LAYER_ORDER = [resetLayer, themeLayer, componentsLayer] as const
