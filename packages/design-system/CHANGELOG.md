# @coldsurfers/design-system

## 0.3.0

### Minor Changes

- [#12](https://github.com/coldsurfers/public/pull/12) [`9a68a61`](https://github.com/coldsurfers/public/commit/9a68a61a1ff0e23fa06565af220efaeed536246b) Thanks [@yungblud](https://github.com/yungblud)! - 카드 4종을 흡수한다 — `ConcertCard` · `ConcertCardSkeleton` · `ArticleCard` · `LeadFeature`.
  새 서브패스 `./cards` 로 연다.

  primitives 와 가르는 선은 **합성 깊이**다. `Button` 은 자기 하나로 끝나지만 카드는
  `CoverBlock` · `Eyebrow` 를 안에서 조립하고, 그래서 API 도 값이 아니라 슬롯(`footer` ·
  `coverAction`)을 받는다. 도메인은 이름에만 남았다 — `ConcertCard` 의 props 는
  `title` · `meta` · `tone` 이라 공연 스키마를 모르고, 라우터도 안 문다.

  진입점이 갈린 이유는 JS 뿐이다. `cssCodeSplit: false` 라 CSS 는 `styles.css` 한 장에
  함께 실린다 — **44.8 kB → 51.3 kB**(gzip 8.18 kB).

## 0.2.0

### Minor Changes

- [#10](https://github.com/coldsurfers/public/pull/10) [`791d3bb`](https://github.com/coldsurfers/public/commit/791d3bbf780bf0ccecbeea56a3efd2372e5b6cb2) Thanks [@yungblud](https://github.com/yungblud)! - ink(dark) 스킴을 폐기하고 light 단일 스킴으로 전환한다. `tokens.color.semantic` 이 `{ light }` 만 갖고, `styles.css` 의 `:root` 는 light 색을 굽는다 — `:root[data-theme='light']` 오버라이드 블록은 사라졌다. RN 쪽에서도 뒤집을 축이 없어져 `ColorSchemeProvider` 와 `SchemeName` 을 걷어냈다. 색 **객체**를 읽는 `useScheme()` 은 호출 계약 그대로 남는다.

  이 패키지는 2026-08-11 에 paul-rockstar 에서 tokens 를 추출하며 dark·light 2스킴 상태로 굳었는데, 원본이 11일 뒤 `[#299](https://github.com/coldsurfers/public/issues/299)` 로 dark 를 폐기하면서 그 결정만 전파되지 않았다. 그 결과 소비 앱은 이 패키지의 dark `:root` 를 자기 light CSS 로 되덮어야 화면이 나왔고, `@import` 두 줄의 순서 하나에 스킴이 걸려 있었다. 값은 드리프트가 없었다 — light 팔레트 29개가 양쪽에서 동일했고, 갈린 건 어느 스킴이 `:root` 인가 하나뿐이다.

  **breaking:** `ColorSchemeProvider` · `SchemeName` 제거, `tokens.color.semantic.dark` 제거. dark 표면을 쓰던 소비자는 자기 CSS 에서 커스텀 프로퍼티를 다시 선언해야 한다.

## 0.1.2

### Patch Changes

- [#8](https://github.com/coldsurfers/public/pull/8) [`52411d7`](https://github.com/coldsurfers/public/commit/52411d75fac0b7008d85b847eb45c73b60d247e2) Thanks [@yungblud](https://github.com/yungblud)! - `coverTone` 을 `primitives` 배럴에서 내보낸다. `CoverBlock.tsx` 는 이미 재수출하며 그 이유를 주석으로 적어 뒀는데(색면이 아닌 표면 — 아바타 원 등 — 이 같은 팔레트를 쓴다) 배럴이 따라가지 않아, 소비처가 딥 경로 없이는 집어갈 수 없었다.

## 0.1.1

### Patch Changes

- [#6](https://github.com/coldsurfers/public/pull/6) [`53fd7a5`](https://github.com/coldsurfers/public/commit/53fd7a52658692a2a0dbee49b6bfb7df15245430) Thanks [@yungblud](https://github.com/yungblud)! - 발행 CSS 의 `@layer` 순서를 바로잡는다. `motion.css.ts` 가 `vars` 를 안 써서 contract 를 거치지 않는 유일한 `.css.ts` 였고, 그 탓에 `cssCodeSplit: false` 번들의 맨 앞에 실려 `ds-components` 를 첫 레이어로 등록했다. `ds-components` 가 가장 약한 레이어가 되면 Tailwind preflight(`base`)가 컴포넌트를 이겨 padding·border 가 지워진다. `./layers.css` 를 부수효과로 물려 순서 선언이 먼저 실리게 했다.

## 0.1.0

### Minor Changes

- [`344b2a7`](https://github.com/coldsurfers/public/commit/344b2a792c25468b7e4835ae05aac76263ce6ec7) Thanks [@yungblud](https://github.com/yungblud)! - feat(design-system): primitives 흡수 + RN native 레인
