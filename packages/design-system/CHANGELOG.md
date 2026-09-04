# @coldsurfers/design-system

## 0.14.0

### Minor Changes

- [#62](https://github.com/coldsurfers/public/pull/62) [`c5803cf`](https://github.com/coldsurfers/public/commit/c5803cfcf118fd510e4c9df53ebc40b5801b3183) Thanks [@yungblud](https://github.com/yungblud)! - `./native` 에 `ConcertCard` 를 낸다 — 웹 `cards/ConcertCard` 의 `bare` 섀시를 RN 으로 옮긴 것. 두 레인이 `contract/concert-card.ts` 하나를 읽는다(props · 치수 표 · variant 축)라 값이나 이름이 갈릴 수 없다. native 는 `bare` 만 구현하므로 그쪽엔 `variant` prop 이 없다.

- [#62](https://github.com/coldsurfers/public/pull/62) [`7fc0023`](https://github.com/coldsurfers/public/commit/7fc0023d6eb71391c8b69bbd1b7d0b0875b5859c) Thanks [@yungblud](https://github.com/yungblud)! - native 레인에 컴포넌트별 진입점을 연다 — `./native/Button` 처럼.

  Metro 는 tree-shaking 을 하지 않아 `./native` 배럴을 열면 9개가 전부 번들된다.
  서브패스로 열면 `Button` 기준 전이 폐포가 18,044 → 6,917 B (-62%) 다.
  배럴은 그대로 남으므로 기존 소비처는 바꿀 것이 없다.

## 0.13.0

### Minor Changes

- [#55](https://github.com/coldsurfers/public/pull/55) [`745d09a`](https://github.com/coldsurfers/public/commit/745d09a580b72ffcb232a34b4dc0858e917d552e) Thanks [@yungblud](https://github.com/yungblud)! - `./layers` 진입점 추가 — `@layer` 이름과 `LAYER_ORDER` 만 담고 CSS 를 안 문다.

  배럴(`.`)은 `styles.css` 를 물어서 번들러 없는 Node 에서 열리지 않는다(`Unknown file extension ".css"`). 순서를 검사하는 쪽이 대개 그 자리다 — 소비 레포의 pre-push 게이트가 `LAYER_ORDER` 를 읽어 상대 순서를 본다. `./tokens`·`./style-utils` 와 같은 규율(값만 필요한 소비자는 CSS 를 지불하지 않는다)의 넷째 진입점.

  배럴은 같은 다섯 이름을 그대로 재수출한다 — 기존 소비자에 변화 없음.

## 0.12.0

### Minor Changes

- [#53](https://github.com/coldsurfers/public/pull/53) [`b4ee4db`](https://github.com/coldsurfers/public/commit/b4ee4db6d356406e66774388d083be92c130acfd) Thanks [@yungblud](https://github.com/yungblud)! - `./tokens.css` 진입점 추가 — `:root` 변수만 담은 한 장(2.5 kB).

  `styles.css` 는 `cssCodeSplit: false` 라 리셋·primitives·cards 가 한 장에 다 실린다. Tailwind
  나 순수 CSS 로 화면을 짜면서 색·간격만 우리 값으로 맞추려는 앱은 그 전량을 물 이유가 없다.

  무레이어 `:root` 다 — 소비 앱이 레이어 순서를 선언하지 않으면 `@layer` 블록은 무레이어 규칙에
  항상 진다. 변수 선언은 캐스케이드 다툼의 대상이 아니라 값의 바닥이다.

  두 시트를 같이 물어도 안전하다. 같은 이름에 같은 값이다.

## 0.11.0

### Minor Changes

- [#18](https://github.com/coldsurfers/public/pull/18) [`e4420c7`](https://github.com/coldsurfers/public/commit/e4420c7db9a7c3cb4a5e1e606119d4dfdc73b143) Thanks [@yungblud](https://github.com/yungblud)! - CSS 를 무는 진입점(`index`·`primitives`·`cards`·`layout`·`motion`·`sprinkles`)이 `styles.css` 를 직접
  물고 온다. 소비자는 `import '@coldsurfers/design-system/styles.css'` 를 더 쓰지 않아도 된다.

  ⚠️ **기존 배선을 지워야 한다.** `./styles.css` export 는 그대로 남지만, 남겨 두면 CSS 가 두 번
  실린다 — `cssCodeSplit` 을 켠 소비처에서는 서로 다른 청크로 각각 나가 번들러가 합치지 못한다
  (web-next 실측: client CSS 237 kB → 183 kB, 54.5 kB 가 중복이었다).

  `native`·`tokens`·`tokens-native`·`style-utils` 는 제외했다: RN 이 CSS 를 물면 Metro 가 깨지고,
  값·헬퍼 진입점은 번들러 없이 Node 에서 여는 길을 남긴다.

## 0.10.0

### Minor Changes

- [#43](https://github.com/coldsurfers/public/pull/43) [`97aa718`](https://github.com/coldsurfers/public/commit/97aa7180e26898a814fc42069db5b4390224d04a) Thanks [@yungblud](https://github.com/yungblud)! - `EmptyState` 추가, sprinkles 에 `textAlign` 축 추가 (coldsurfers/public#42 Phase 1)

  「아직 아무것도 없습니다」 자리가 web-next 에 5벌 흩어져 있었다 — `Tonight` · `NearBy` ·
  `ThisWeekend` · `NotificationsSurface` · `WorkSearch`. 컴포넌트가 드는 건 **세우는 방식 다섯 줄**
  (`flex` 세로 스택 · 가운데 정렬 · `textAlign` · `gap`)뿐이다.

  - **조판을 props 로 받지 않는다.** 5벌의 제목 조판이 이미 셋으로 갈려 있어(`xl/strong/700` ·
    `base/500/text` · `15px/text`) `title`/`description` 으로 접으면 정본을 골라야 하고 다섯 중
    넷이 시각적으로 바뀐다. 조판은 `children` 이 든다 — 덕분에 액션 슬롯도 필요 없다
    (`NearBy` 는 CTA 자리에 링크가 아니라 *반경 넓히기 버튼 N개*가 들어간다)
  - **바깥 여백을 소유하지 않는다.** 실측 셋(80·64·24px)이 전부 space 스케일에 떨어져 호출부
    sprinkles 한 줄로 내려간다 — `PageBanner`·`Callout`·`UnderlineTabs` 와 같은 규율
  - **`gap` 만 컴포넌트 몫.** 실측이 16px : 8px 로 갈려 다수를 정본으로 골랐다. CTA 가 서는
    클러스터라 여백이 좁으면 버튼이 문구에 붙는다
  - `asChild` — 지면이 이미 `Container` 로 셸을 세운 자리에서 래퍼가 겹치지 않게 한다

  ⚠️ 이름이 `ContentPlaceholder` 가 아닌 이유: seed 의 같은 이름은 *이미지가 안 뜬 자리*의 아이콘
  박스고, 그 축은 `CoverBlock` 이 이미 든다.

  sprinkles `textAlign` 축은 `EmptyState` 의 가운데 정렬을 소비처가 뒤집을 자리로 열었다.
  `ds-utilities` 라 `ds-components` 를 확실히 이긴다 — 로컬 `.css.ts` 로 덮으면 같은 레이어 안에서
  소스 순서가 승자를 정하게 된다. 덤으로 web-next 7개 파일의
  `style(inComponentsLayer({ textAlign: 'center' }))` 복붙이 사라진다.

## 0.9.0

### Minor Changes

- [#40](https://github.com/coldsurfers/public/pull/40) [`0c02c30`](https://github.com/coldsurfers/public/commit/0c02c3023f4b0eac2523ff4ea7d7f749885b3e0b) Thanks [@yungblud](https://github.com/yungblud)! - `UnderlineTabs`/`UnderlineTab` 추가, `Chip` 에 `asChild` 추가 (coldsurfers/public#39 Phase 1)

  밑줄 탭이 web-next 에 4벌 흩어져 있었다 — `VenueDetail` · `SettingsTop` · `StageSearchOverlay` ·
  `DailyIndex`. 4벌이 **이미 완전히 일치하던 것**(비활성 `muted` + `:hover strong` · 활성 밑줄 2px ·
  활성 굵기 700)만 컴포넌트가 들고, 갈라져 있던 건 정본을 골라 접었다.

  - 여백·`gap` 은 소유하지 않는다 — 실측 4벌이 12·10·7px 에 하나는 `paddingTop` 구조, `gap` 은
    4벌 4값이다. 셸 치수는 지면이 안다는 `PageBanner`·`Callout` 규율 그대로
  - `-1px` 겹침을 컴포넌트가 든다 — 없으면 밑줄이 줄 괘선 **아래로 1px 뜬다.** 4벌 중 둘이 실제로 떠 있었다
  - 선택 신호는 엘리먼트가 정한다 — `asChild`(링크)면 `aria-current="page"` 를 기본으로 넣고,
    `<button>` 이면 `aria-pressed`. 라우팅 링크에 `role="tab"` 은 틀렸다(화살표 키 요구를 못 지킨다)

  `Chip` 은 **스타일이 한 줄도 안 바뀐다.** `active` 의 시각 언어(반전)를 정본으로 확정하고,
  필터 칩이 크롤 가능한 `<a href>` 로 나갈 수 있도록 `asChild` 만 열었다.

## 0.8.0

### Minor Changes

- [#37](https://github.com/coldsurfers/public/pull/37) [`fd53724`](https://github.com/coldsurfers/public/commit/fd53724589e91f9f75fd49002b12d26c4b2b7fb0) Thanks [@yungblud](https://github.com/yungblud)! - `Callout` primitive 를 연다 — 본문 흐름에 끼는 인라인 알림 상자.

  `tone`(`accent`·`success`·`warning`·`danger`) 축과 `action` 슬롯. 소비처 둘이 같은 역할을 하면서
  **공유하는 값이 하나도 없던** 상태를 흡수한다 — 틴트 메커니즘 둘(손수 `color-mix` vs `XBg` 토큰),
  농도 둘(7% vs 14%), radius 둘(12 vs 10), padding 둘.

  틴트는 **톤 전경 토큰에서 파생**한다(배경 14% · 테두리 28%). `statusSuccessBg` 를 조회하지 않는 건
  `color-mix(statusSuccess 14%, transparent)` 와 수치가 같은데다, `accent` 엔 `XBg` 짝이,
  테두리엔 `XBorder` 토큰이 아예 없어서다 — 조회로 통일하려면 토큰 계약을 늘려야 한다. **토큰은
  건드리지 않았다.**

  `role` 은 붙여주지 않는다(`...rest` 통과). 같은 상자가 읽혀야 할 때와 읽히면 방해일 때가 있고
  그건 DS 가 알 수 없는 맥락이다. `margin` 도 소유하지 않는다 — 바깥 여백은 지면 몫.

  근거·결정 로그 6건: coldsurfers/public#34

## 0.7.0

### Minor Changes

- [#35](https://github.com/coldsurfers/public/pull/35) [`6decbe5`](https://github.com/coldsurfers/public/commit/6decbe5e3ab84ac74823fc2a8fd23c99ceafd96b) Thanks [@yungblud](https://github.com/yungblud)! - `./layout` 에 `PageBanner` 를 추가한다 — 다크 풀블리드 밴드(바닥 · 셸 · `Title`/`Body` 타이포).

  가로축은 `Container` 가 그대로 든다. 소비처 둘이 `max-width:1440px` + gutter 를 각자 다시
  선언하다 브레이크포인트가 갈렸던 게(tablet vs desktop) 발단이라, 새 셸을 만들지 않고
  `Container` 위에 세로 여백만 얹는다.

  `align` 축은 열지 않았다 — 두 소비처의 정렬이 다르지만 각 정렬의 실사용이 1곳씩이라 추출할
  중복이 없다. 배치는 `children` 이 정한다. 근거·결정 로그: coldsurfers/public#33

## 0.6.0

### Minor Changes

- [#31](https://github.com/coldsurfers/public/pull/31) [`7e59cb5`](https://github.com/coldsurfers/public/commit/7e59cb5f7c8f3958c64e52e650872c2dbd9fdb12) Thanks [@yungblud](https://github.com/yungblud)! - `Modal` 에 `placement` 축을 연다 — `center`(기본) · `top` · `bottom`. `bottom` 이 바텀시트 자리다.

  소비처 실측 5곳 중 4곳이 `sprinkles({ alignItems: 'center', justifyContent: 'center' })` 를 문자 그대로 복붙하고 있었다. 축이 없던 게 아니라 기본값이 없었다. 기존 소비처는 기본값 `center` 로 픽셀이 그대로다.

  오버레이의 `padding` 이 base 에서 placement variant 로 내려갔다 — `bottom` 만 0 이라 base 에 두고 덮으면 같은 레이어 안 소스 순서에 기대는 규칙이 된다.

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
