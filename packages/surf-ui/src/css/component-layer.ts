import type { StyleRule } from '@vanilla-extract/css'
import { componentsLayer } from './layers'

/**
 * 스타일 규칙을 `ds-components` 레이어에 넣는다.
 *
 * 왜 헬퍼인가: VE 의 레이어 지정은 `{ '@layer': { [이름]: 규칙 } }` 중첩 형태라, 그대로 쓰면
 * recipe 의 base·variant 마다 두 겹이 늘어 정작 스타일이 안 보인다. 컴포넌트 스타일은 예외 없이
 * 이 레이어에 들어가므로 한 단어로 접는 게 맞다.
 *
 * 이 레이어에 넣는 이유: 호출자가 넘긴 유틸 클래스(과도기엔 Tailwind, Phase 6 이후 sprinkles)가
 * 더 뒤 레이어라 **항상 이긴다**. `className` prop 이 컴포넌트 기본값을 덮는다는 약속이
 * 소스 순서·상세도 운에 기대지 않고 캐스케이드로 보장된다.
 * 순서 정본: `layers.ts` 의 `LAYER_ORDER`.
 */
export const inComponentsLayer = (rule: StyleRule): StyleRule => ({
  '@layer': { [componentsLayer]: rule },
})
