# @coldsurfers/design-system

## 0.5.1

### Patch Changes

- [#28](https://github.com/coldsurfers/public/pull/28) [`6aaf5da`](https://github.com/coldsurfers/public/commit/6aaf5da90e6fdbbfab4f1e838502eeba2d555cb1) Thanks [@yungblud](https://github.com/yungblud)! - `pulse` 가 `prefers-reduced-motion: reduce` 를 존중한다 — 맥동을 끄고 불투명도 0.6 의 정지 상태로 둔다(`ThinkingDots` 와 같은 처리). `Skeleton` 이 `pulse` 를 품고 있어 소비처는 아무것도 안 바꿔도 된다.

## 0.5.0

### Minor Changes

- [#26](https://github.com/coldsurfers/public/pull/26) [`a6d3b54`](https://github.com/coldsurfers/public/commit/a6d3b54b6f55564127a248a1bc1e47eb0bbfd428) Thanks [@yungblud](https://github.com/yungblud)! - `./primitives` 에 `Skeleton` 을 추가한다.

  로딩 자리표시자를 한 어휘로 묶는다. 치수는 단일값 props(`width`·`height`·`aspectRatio`)로 받고,
  `@media` 분기는 `className` 이 맡는다. 바탕은 `neutral`·`onCover` 두 톤이고 `aria-hidden` 은
  기본으로 박힌다. 이미 치수를 가진 스타일 위에 맥동만 얹는 자리는 `asChild`.

  `cards/ConcertCardSkeleton` 의 `barBase` 는 같은 톤 소스(`skeletonToneValue.neutral`)를 읽는다 —
  값은 그대로라 시각 변화는 없다.

## 0.4.0

### Minor Changes

- [#20](https://github.com/coldsurfers/public/pull/20) [`067238c`](https://github.com/coldsurfers/public/commit/067238c2796a10fe136f15f718529237857bb1d2) Thanks [@yungblud](https://github.com/yungblud)! - `./layout` 진입점 추가 — 표면 레이아웃 `Page` · `Container`.

  seed-design 의 `AppScreen`(stackflow) 이 모바일 스택 화면에 하는 일을 웹 문서 표면으로 옮긴 것.
  `Page` 는 `min-height:100vh` 세로 스택 + `data-surface` 마커 + 표면 스타일 주입구(`style`),
  `Page.Content` 는 `<main>` + `flex:1` 로 짝을 이룬다. `Container` 가 gutter 정본
  (`max-width:1440px` · `padding-inline` 6/16).

  상·하단 chrome 은 슬롯 래퍼 없이 `Page` 의 자식으로 놓는다 — 헤더/푸터 내용물과 표면 팔레트는
  소비 앱의 것이다. 근거·결정 로그: coldsurfers/public#19

  `Container` 는 `as` 로 태그를 고른다(`div` 기본 · `section`/`main`/`aside`/`header`/`footer`).
  gutter 는 정렬축이지 의미가 아니라서, 같은 세로선에 서는 것들이 표면 안에서 `<section>`·`<div>`·
  `<main>` 으로 갈린다 — 실측 web-next 34곳 중 26곳이 `<section>` 이다.

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
