# @coldsurfers/data-models

## 0.16.0

### Minor Changes

- [`9af8d4e`](https://github.com/coldsurfers/public/commit/9af8d4e57f71dc31574bdddcd0bdb9b274a9cb59) Thanks [@yungblud](https://github.com/yungblud)! - 산문 편에 `author` 를 연다 — 글쓴이 핸들 문자열 하나(`'yoonseul'`). 없으면 표면이 그 칸을 접는다.

  진용 union(`@paul-rockstar/persona` 의 `EditorialHandle`)을 여기서 물지 않는다. 계약 패키지가 소비처를 아는 거꾸로가 되기 때문이고, 좁히는 건 아는 쪽(발행 파이프·표면)의 몫이다. 표시 이름이 아니라 핸들을 드는 건 이 값이 글쓴이 지면 URL(`/daily/contributors/<핸들>`)을 겸해서다.

## 0.15.0

### Minor Changes

- [#207](https://github.com/coldsurfers/public/pull/207) [`0a2e18c`](https://github.com/coldsurfers/public/commit/0a2e18cb5acbd9b93fa8ff31fcb9c8ef7f995f09) Thanks [@yungblud](https://github.com/yungblud)! - 산문 편의 `concert` 블록이 slug 대신 공연 사실(`DailyConcert`)을 통째로 든다.

  **⚠️ breaking** — `{ type: 'concert', slug }` → `{ type: 'concert', concert }`. 이미 발행된 산문 편은 재발행해야 파싱된다(현재 1건).

  처음엔 레퍼런스(Bandcamp Daily)를 따라 body 에 id 만 두고 실물은 별도 응답에서 받는 꼴로 뒀다. 그런데 우리 읽기 면에는 그 *별도 응답*이 없어서, 표면이 티켓을 못 그리고 slug 를 글자 그대로 문단에 뱉었다(paul-rockstar#484 리뷰).

  픽(`DailyPickSchema`)과 같은 축으로 맞춘다 — 사실은 발행 시점에 얼어붙고, 채우는 건 사람이 아니라 발행 파이프다.

## 0.14.1

### Patch Changes

- [#205](https://github.com/coldsurfers/public/pull/205) [`da28f96`](https://github.com/coldsurfers/public/commit/da28f96c25a16744c2e391338732905a7338cf8a) Thanks [@yungblud](https://github.com/yungblud)! - `DailyEditionData` 가 소비자 쪽에서 `any` 로 풀리던 것을 고친다.

  `z.infer` 에 맡긴 결과 발행본 `.d.ts` 가 `z.ZodPreprocess<…, unknown>` 을 그대로 적어 냈는데,
  그 인터페이스의 **인자 수가 zod 버전마다 다르다** — 4.4.3 은 `<B>` 하나, 4.5.4 는 `<B, I>` 둘.
  우리는 4.5.x 로 빌드하고 소비자는 4.4.x 를 물고 있어 그 줄이 TS2558 로 떨어졌고,
  `skipLibCheck` 아래에서는 조용히 `any` 가 됐다(`DailyEditionData` · `DailyEditionFeedPayload['edition']` 둘 다).

  `DailyEditionData` 를 손으로 적고(`DailyDigestEdition | DailyProseEdition`) 스키마 상수에
  `z.ZodType<DailyEditionData, unknown>` 을 명시한다. 두 버전에서 인자 수가 같은 타입이라 그 틈이
  안 생긴다. **런타임 스키마는 그대로**고 좁혀지는 건 타입 표면뿐이다.

## 0.14.0

### Minor Changes

- [#203](https://github.com/coldsurfers/public/pull/203) [`e80d867`](https://github.com/coldsurfers/public/commit/e80d867fcedf416d7baba9106ef2fa1776e2f999) Thanks [@yungblud](https://github.com/yungblud)! - `/daily` 편 본문(`DailyEditionDataSchema`)을 `kind('digest'|'prose')` 판별 union 으로 쪼갠다.
  `features` 안에 공연 묶음이 아니라 **글**이 본문인 편을 세우기 위한 것이고, 다이제스트 쪽
  필드는 **하나도 바뀌지 않았다**(`kind` 만 얹혔다).

  산문 편의 본문은 블록 배열(`DailyBlockSchema`)이다 — `paragraph`·`concert`·`image`·`divider`
  4종. 레퍼런스(Bandcamp Daily `/features`)의 55블록짜리 기사를 DOM 으로 뜯어 실제로 쓰인 것이
  그 넷뿐이라 그만 연다. `concert` 블록은 slug 만 들고 실물은 렌더 시점 조회로 채운다.

  ⚠️ **`z.preprocess` 가 앞에 붙는다.** 이미 발행된 편 38개에 `kind` 가 없고(실측 38/38),
  판별자가 없으면 `discriminatedUnion` 이 디스패치 단계에서 떨어진다. 읽는 쪽은 파싱 실패한 편을
  조용히 버리므로 그냥 얹으면 아카이브가 통째로 사라진다. `.default('digest')` 로는 안 구해진다 —
  기본값은 디스패치 **이후에** 적용된다. 저장된 편에 `kind` 를 백필하면 이 shim 은 뗄 수 있다.

## 0.13.0

### Minor Changes

- [#201](https://github.com/coldsurfers/public/pull/201) [`1ca4c2d`](https://github.com/coldsurfers/public/commit/1ca4c2d872cbb0f7a95ba2370de7b09fbc305b19) Thanks [@yungblud](https://github.com/yungblud)! - `/daily` 시리즈 축에 `features` 를 연다. 형제 셋(`new-shows`·`weekend`·`popular`)은 상류가
  달력이나 조회수라 자동으로 서는데, 명절·연휴처럼 그때만 서는 편은 붙일 자리가 없었다.
  키만 늘리고 라벨·리드는 `@paul-rockstar/daily` 의 `DAILY_SERIES` 가 든다.

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
