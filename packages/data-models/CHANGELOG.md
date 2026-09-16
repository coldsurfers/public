# @coldsurfers/data-models

## 0.12.2

### Patch Changes

- [#150](https://github.com/coldsurfers/public/pull/150) [`7520a2f`](https://github.com/coldsurfers/public/commit/7520a2f1da58742a5523bffcac87a224c374459a) Thanks [@yungblud](https://github.com/yungblud)! - 검색 DTO 의 artist `profileImgUrl` 을 nullable 로 교체. 프로필 이미지가 없는 아티스트(실측 93.8%)가 소비자의 행 단위 `safeParse` 에서 버려져 검색 결과에서 통째로 사라지던 문제.

## 0.12.1

### Patch Changes

- [#132](https://github.com/coldsurfers/public/pull/132) [`caee332`](https://github.com/coldsurfers/public/commit/caee3327a6f5f23f39c79c1dd912641a161609e3) Thanks [@yungblud](https://github.com/yungblud)! - `locationCityId` 에서 `uuid()` 검사를 뗀다 — 서버가 자기가 발급한 id 를 거부하고 있었다.

  `LocationCity` 두 행(`jeollanam-do` · `jeollabuk-do`)의 id 가 RFC 4122 **variant** 자리를
  벗어나 있다. 모양은 `8-4-4-4-12` 라 UUID 처럼 보이지만, 17번째 hex 자리의 상위 2비트가
  `10` 이어야 하는데 각각 `01`(`6a3d`) · `00`(`3f0c`) 이다.

  zod v3 의 `.uuid()` 는 모양만 봐서 통과시켰고 **v4 가 RFC 검사로 조이면서** 드러났다.
  billets-server 는 zod 4 라 `GET /v2/events?locationCityId=…` 가 그 두 도시에서만 400 을
  뱉는다 — 같은 서버의 `GET /v1/location/country` 가 방금 내준 값인데도.

  원인은 계약의 비대칭이다. 같은 패키지 `location.dto.ts` 는 이 id 를 **내보낼 때**
  `z.string()` 으로 두는데 받을 때만 `.uuid()` 였다. 나가는 문은 열고 들어오는 문만 잠근 꼴이라,
  맞춰야 할 쪽은 받는 쪽이다.

  푼 자리는 넷, 전부 **들어오는** 값이다 — 응답 스키마는 하나도 건드리지 않았다.

  - `GetEventsQueryStringDTOSchema` — 목록 조회
  - `GetRecommendedEventsQueryStringDTOSchema` — 추천 목록
  - `BaseDraftEventDataDTOSchema` — 드래프트 저장
  - `FindManyConcertDTOSchema` — repository 입력

  추론된 타입은 넷 다 `string` 그대로라 소비처의 타입은 바뀌지 않는다. 형식 검증이 막아주던
  것도 실질적으로 없었다 — 값은 파라미터 바인딩으로 조회에만 들어가고, 틀리면 0건이다.

  id 값 자체를 고치는 건 이 변경의 몫이 아니다. 앱이 `cityId` 를 기기에 저장하므로,
  **DB 의 PK 를 바꿔도 이미 옛 id 를 들고 있는 기기는 살아나지 않는다** — 그쪽을 되살리는 건
  이 완화뿐이다. 데이터 정리는 별건으로 둔다.

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
