/**
 * `@coldsurfers/design-system` — 정본 배럴.
 *
 * 여기가 갖는 건 **계약과 순서**다: 어떤 이름을 쓸 수 있는가(`vars`)와
 * 겹쳤을 때 누가 이기는가(`@layer`). 값 자체는 `./tokens` 서브패스.
 *
 * 아래 두 줄의 부수효과 import 가 `styles.css` 의 내용물을 정한다. VE 는 모듈 그래프에
 * 닿은 `.css.ts` 만 굽기 때문에, 이 파일이 안 물면 그 CSS 는 아예 안 나온다.
 * 반대로 물면 `cssCodeSplit: false` 라 **소비자가 쓰든 안 쓰든 한 파일에 실린다** —
 * 무엇을 넣을지가 곧 소비자가 지불하는 바이트다.
 *
 * `reset` 을 넣은 이유: `ds-reset` 은 가장 약한 레이어라 소비 앱의 레이어 밖 규칙에 항상 지고,
 * 내용도 실측 공통분모(`*` box-sizing + `body` 4속성)뿐이다. 소비자가 import 한 줄로 끝나는 값이
 * 그 위험보다 크다.
 *
 * `sprinkles` 는 여기 없다 — JS 38 kB 라 `./sprinkles` 진입점으로 갈랐다. 이유는 `sprinkles.ts`.
 * (CSS 는 그쪽 진입점이 그래프에 있으므로 어차피 `styles.css` 에 함께 실린다.)
 */
import './css/theme.css'
import './css/reset.css'

export { inComponentsLayer } from './css/component-layer'
export { vars } from './css/contract.css'
export {
  componentsLayer,
  LAYER_ORDER,
  resetLayer,
  tokensLayer,
  utilitiesLayer,
} from './css/layers'
export { media } from './css/media'
