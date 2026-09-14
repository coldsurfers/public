/**
 * 레이어 이름과 순서의 SSOT. 발행은 `layers.css.ts` 가 한다.
 *
 * `--wbe-` 네임스페이스와 같은 이유로 `wbe-` 접두를 쓴다 — design-system(`ds-*`)과
 * 한 화면에 실려도 서로의 순서를 흔들지 않는다.
 *
 * `:root` 변수는 레이어에 없다. VE `createGlobalTheme` 이 레이어 밖에 찍고, 커스텀
 * 프로퍼티는 캐스케이드 충돌이 없어 순서를 다툴 일이 없다 — 빈 레이어를 계약으로
 * 내놓지 않는다.
 *
 * sprinkles 도 여기에 없다. **레이어 밖(unlayered)이 모든 레이어를 이기므로**,
 * 호출부가 넘긴 유틸이 컴포넌트 스타일을 덮는 자리는 레이어를 안 다는 쪽이 맞다.
 */

/** 엘리먼트 기본값. 무엇에든 져야 하므로 가장 약하다. */
export const resetLayer = 'wbe-reset'

/** recipe·표면 스타일. */
export const componentsLayer = 'wbe-components'

export const LAYER_ORDER = [resetLayer, componentsLayer] as const
