import { globalLayer } from '@vanilla-extract/css'
import { LAYER_ORDER } from './layers'

/**
 * 캐스케이드 순서를 CSS 로 발행하는 유일한 자리.
 *
 * `@layer a,b,c;` 는 이름이 이미 있으면 재정렬하지 않는 no-op 이라, 여러 청크가 각자 선언해도
 * **가장 먼저 로드된 청크가 순서를 확정**한다. 그래서 `theme.css.ts` 와 `reset.css.ts` 가
 * 각자 이 함수를 부른다 — 둘 중 무엇이 먼저 실려도 순서가 선다.
 */
export function declareLayerOrder(): void {
  for (const name of LAYER_ORDER) {
    globalLayer(name)
  }
}

declareLayerOrder()
