import { keyframes, style } from '@vanilla-extract/css'
import { SKELETON_SPEC as spec } from '../contract'
import { inComponentsLayer } from './component-layer'
// 부수효과 import — 이 파일은 `vars`(= `css/contract.css`, VE 계약)를 안 쓰는 유일한 `.css.ts` 다.
// 위의 `../contract` 는 이름이 비슷하지만 순수 TS 값 표라 CSS 를 물고 오지 않는다.
// 그대로 두면 발행 번들(`cssCodeSplit: false`)의 맨 앞에 실려 `ds-components` 를 첫 레이어로
// 등록해버리고, 그러면 `base`(Tailwind preflight)가 컴포넌트를 이겨 padding·border 가 지워진다.
import './layers.css'

const pulseFrames = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: spec.pulse.minOpacity },
})

/**
 * Tailwind `animate-pulse` 등가 — 스켈레톤 전용.
 *
 * `prefers-reduced-motion: reduce` 면 맥동을 끄고 **한 톤 죽인 정지 상태**로 둔다. 자리표시자는
 * "아직 안 왔다" 를 알리는 게 일이라, 애니메이션을 지우면서 불투명도까지 1 로 되돌리면 실제
 * 내용과 구분이 안 된다. `ThinkingDots` 와 같은 처리다.
 */
export const pulse = style(
  inComponentsLayer({
    animationName: pulseFrames,
    animationDuration: `${spec.pulse.durationMs}ms`,
    animationTimingFunction: `cubic-bezier(${spec.pulse.easing.join(', ')})`,
    animationIterationCount: 'infinite',
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        animationName: 'none',
        opacity: spec.pulse.reducedOpacity,
      },
    },
  }),
)
