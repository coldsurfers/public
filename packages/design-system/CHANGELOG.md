# @coldsurfers/design-system

## 0.1.1

### Patch Changes

- [#6](https://github.com/coldsurfers/public/pull/6) [`53fd7a5`](https://github.com/coldsurfers/public/commit/53fd7a52658692a2a0dbee49b6bfb7df15245430) Thanks [@yungblud](https://github.com/yungblud)! - 발행 CSS 의 `@layer` 순서를 바로잡는다. `motion.css.ts` 가 `vars` 를 안 써서 contract 를 거치지 않는 유일한 `.css.ts` 였고, 그 탓에 `cssCodeSplit: false` 번들의 맨 앞에 실려 `ds-components` 를 첫 레이어로 등록했다. `ds-components` 가 가장 약한 레이어가 되면 Tailwind preflight(`base`)가 컴포넌트를 이겨 padding·border 가 지워진다. `./layers.css` 를 부수효과로 물려 순서 선언이 먼저 실리게 했다.

## 0.1.0

### Minor Changes

- [`344b2a7`](https://github.com/coldsurfers/public/commit/344b2a792c25468b7e4835ae05aac76263ce6ec7) Thanks [@yungblud](https://github.com/yungblud)! - feat(design-system): primitives 흡수 + RN native 레인
