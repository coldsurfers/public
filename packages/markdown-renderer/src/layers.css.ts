import { LAYER_ORDER } from '@coldsurfers/design-system'
import { globalLayer } from '@vanilla-extract/css'

/**
 * 캐스케이드 순서를 **이 패키지의 스타일시트에서 한 번 더 선언한다.**
 *
 * `@layer a,b,c;` 는 이미 등록된 이름을 재정렬하지 않는 no-op 이므로, DS 의 `styles.css` 와
 * 이 패키지의 `styles.css` 중 **먼저 로드된 쪽이 순서를 확정**하고 다른 쪽은 무시된다.
 * 선언이 여기 없으면 이 파일이 먼저 실릴 때 `ds-components` 가 첫 등장으로 자리를 잡아
 * `base`(Tailwind preflight)보다 앞서고, 그러면 컴포넌트의 padding·border 가 지워진다.
 * 2026-08-03 · 2026-08-04 에 실제로 겪은 사고다 — 근거는 DS 의 `css/layers.css.ts`.
 *
 * 순서의 정본은 DS 의 `LAYER_ORDER` 하나뿐이다. 여기선 읽어서 발행만 한다.
 */
for (const name of LAYER_ORDER) {
  globalLayer(name)
}
