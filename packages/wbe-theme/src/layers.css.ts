import { globalLayer } from '@vanilla-extract/css'
import { LAYER_ORDER } from './layers'

/**
 * 캐스케이드 순서를 CSS 로 발행하는 유일한 자리. 모듈 스코프에서 한 번 돈다.
 *
 * design-system 은 이 선언을 진입점마다 다시 부르는데, CSS 청크가 여러 개라
 * "어느 청크가 먼저 로드돼도 순서가 서게" 하려는 것이다. 이 패키지는
 * `cssCodeSplit: false` 라 CSS 가 한 장이다 — 근거가 안 따라와서 안 부른다.
 */
for (const name of LAYER_ORDER) {
  globalLayer(name)
}
