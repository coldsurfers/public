import { keyframes, style } from '@vanilla-extract/css'
import { inComponentsLayer } from './component-layer'
// 부수효과 import — 이 파일은 `vars` 를 안 써서 contract 를 거치지 않는 유일한 `.css.ts` 다.
// 그대로 두면 발행 번들(`cssCodeSplit: false`)의 맨 앞에 실려 `ds-components` 를 첫 레이어로
// 등록해버리고, 그러면 `base`(Tailwind preflight)가 컴포넌트를 이겨 padding·border 가 지워진다.
import './layers.css'

const pulseFrames = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
})

/** Tailwind `animate-pulse` 등가 — 스켈레톤 전용. */
export const pulse = style(
  inComponentsLayer({
    animationName: pulseFrames,
    animationDuration: '2s',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    animationIterationCount: 'infinite',
  }),
)
