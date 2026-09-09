# @coldsurfers/data-models

## 0.12.0

### Minor Changes

- [#101](https://github.com/coldsurfers/public/pull/101) [`9bdce16`](https://github.com/coldsurfers/public/commit/9bdce16dccc92e5d4c48370730c8d9ac63c06c0e) Thanks [@yungblud](https://github.com/yungblud)! - DTO·zod 스키마 계약을 공개 패키지로 연다.

  같은 이름의 패키지가 `paul-rockstar` 와 `surfers-root` 두 레포에 각자 있었고, 버전 번호는 둘 다
  0.11.1 인데 내용이 갈려 있었다(`surfers-root` 사본은 2026-06-06 이후 정지). 이 패키지가 그 둘을
  대체한다 — `paul-rockstar` 정본 56파일이 원본이다.

  - **진입점은 루트 배럴 하나** (`.`). 형제 `shared-utils` 가 배럴을 버린 근거 두 개(DOM 의존 ·
    무거운 의존)가 여기선 성립하지 않고, DTO 가 서로를 참조하는 그래프라 파일 경계가 공개 API
    경계가 되지 못한다. 소비처 135파일 import 무수정.
  - **`peerDependencies: { zod: ">=3.23.8" }`** — zod 3·4 둘 다 받는다. v4 전용 API 사용 0.
    `typescript` peer 는 뺐다: `dist` + rollup 된 `.d.ts` 를 내므로 소비자가 우리 소스를
    컴파일하지 않는다.
  - **`FeedEntityTypes.BLOG_ARTICLE` · `FeedDefinitions.NEW_BLOG_ARTICLE_RELEASE` 를
    `@deprecated` 로 되살렸다.** `surfers-root` 의 `wamuseum-server` 가 아직 이 이름을 쓰고,
    무엇보다 **DB 에 두 `FeedDefinition` row 가 다 살아 있다**(`NEW_BLOG_ARTICLE_RELEASE`
    2025-12-22 · `NEW_EDITORIAL_RELEASE` 2026-07-11 — 개명이 아니라 추가였다). 정본에서 빼둔 채로
    발행하면 `FeedDefinitionDTOSchema.key` 가 DB 에 실재하는 row 를 거부한다.

  버전 seed 를 0.11.1 로 둔 이유: `surfers-root` 가 changeset 으로 0.11.1 까지 이미 찍었으므로,
  새 릴리스가 그보다 위(0.12.0)여야 소비자가 낡은 사본으로 해석되지 않는다.
