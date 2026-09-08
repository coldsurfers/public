# @coldsurfers/shared-utils

## 0.3.0

### Minor Changes

- [#97](https://github.com/coldsurfers/public/pull/97) [`6a058ce`](https://github.com/coldsurfers/public/commit/6a058ceac8ac42abd3133a8cbfa2e03c8e9919f1) Thanks [@yungblud](https://github.com/yungblud)! - SEO 어댑터(`/metadata` · `/next` · `/seo-head`)와 `/jwt` 진입점 추가.

  paul-rockstar 의 workspace 사본(`@coldsurf/shared-utils`)에 남아 있던 마지막 모듈들이다. 이걸로
  그 패키지를 지울 수 있게 된다 — 소비처는 두 레포(paul-rockstar · surfers-root).

  - `/metadata` — `buildSeoTags`. 페이지 입력 → 평평한 `SeoTags`(meta·link·JSON-LD). 프레임워크
    의존 0. `schema-dts` 는 타입 전용이고 `rollupTypes` 가 `.d.ts` 안으로 인라인해서 소비자에겐
    안 보인다 → peer 가 아니라 devDependency.
  - `/next` — `createNextMetadata` · `buildSeoScripts`. 엔진 출력 → Next `Metadata`.
    `next` optional peer(타입 전용, `next/types`).
  - `/seo-head` — `createSeoHead`. 엔진 출력 → `{ meta, links, scripts }`.
    **구 `/react` 인데 react 를 물지 않아 이름을 바꿨다** — 원본에서 react 를 쓰던 건
    `useDebouncedCallback` 뿐이고 그건 양쪽 레포 사용처가 0이라 안 옮겼다. 추가 설치 없음.
  - `/jwt` — `decodeJwt`. `jwt-decode` optional peer.

  사용처 0건이라 옮기지 않은 것: `pickFile`(DOM · surfers-root 는 자기 사본을 쓴다) ·
  `createSeo` · `useDebouncedCallback` · `createCommonCookieOptions`(paul 은 자기 사본을 쓴다) ·
  `loginProviderSchema`/`LoginProvider`(양쪽 다 로컬 `@/types/auth` 를 쓴다) → zod 축 자체가 없다.

## 0.2.0

### Minor Changes

- [#95](https://github.com/coldsurfers/public/pull/95) [`b9d8f8c`](https://github.com/coldsurfers/public/commit/b9d8f8c2cc3648dcfb54743060cb0ffefb998977) Thanks [@yungblud](https://github.com/yungblud)! - **루트 배럴을 없앴다.** `모듈 하나 = 파일 하나 = 진입점 하나` 이고 예외가 없다 —
  `import … from '@coldsurfers/shared-utils'` 는 이제 에러다(`ERR_PACKAGE_PATH_NOT_EXPORTED`).

  배럴을 두면 "무엇을 올릴지" 기준이 필요한데, 그게 (1) DOM·React 를 무는가 (2) 무거운 의존을
  무는가 — 둘 다 **모듈 내부 사정**으로 수렴한다. 그걸 배럴 소속에 연결하면 유틸이 의존을 하나
  무는 순간 배럴에서 빠져야 하고 그건 major breaking 이다. 진입점만 있으면 그 이동이 없다.

  (2) 를 tree-shaking 으로 못 푸는 이유: **해소가 tree-shaking 보다 먼저다.** 번들러는 모듈을
  찾아 파싱해야 그 export 가 안 쓰인다고 판정할 수 있어서, 설치 안 된 optional peer 는 그래프를
  만드는 단계에서 죽는다. `sideEffects: false` 도 external 도 이걸 막지 못한다.

  `paul-rockstar` 사내 패키지에 남아 있던 환경 중립 유틸을 옮겨 왔다. 그 레포의 사내 사본을
  없애고 이 패키지를 SSOT 로 두는 과정의 두 번째 조각이다.

  새 진입점 9개 — `/constants` · `/email` · `/event-category` · `/kopis-price` ·
  `/location-city` · `/number` · `/parser` · `/slug` · `/uri` · `/uuid`.
  (`/date` 는 그대로, 루트 `.` 는 삭제.)

  - `normalizeEmail` — `+alias` 를 걷어낸 이메일 신원. dot 은 건드리지 않는다(Gmail 외
    프로바이더는 dot 을 다른 주소로 구분하는 경우가 있어 서로 다른 사람을 합칠 위험)
  - `kopisPriceUtils` — KOPIS 비정형 `price` 문자열 → 좌석 등급별 가격표. fail-open(throw 없음)
  - `eventCategoryUtils` · `locationCityUtils` — 원본 식별자 → 한국어 표기. 모르는 값은 그대로
  - `/slug` — 공연 슬러그·해시태그·중복 회피. `slugify` 는 일반 dependency 라 저절로 따라오고,
    `date-fns` 만 소비처가 직접 설치한다

  `tryParse` 의 기본 타입 인자가 `any` 에서 `unknown` 으로 바뀌었다 — 파싱 결과는 런타임에
  무엇이든 될 수 있어 좁히지 않고 쓰면 타입이 거짓말을 한다. 호출부는 `tryParse<Config>(raw)` 로
  형태를 선언한다.

  `pnpm check:exports` 에 진입점 정합 게이트가 붙었다. 모듈을 추가하고 `exports` 갱신을 잊으면
  빌드·타입체크·테스트를 다 통과한 채로 그 유틸만 조용히 발행에서 빠지는데, 그 창을 닫는다.

## 0.1.0

### Minor Changes

- [#93](https://github.com/coldsurfers/public/pull/93) [`65fae9a`](https://github.com/coldsurfers/public/commit/65fae9a4d128f7c2181e3901b68b543dff06f65f) Thanks [@yungblud](https://github.com/yungblud)! - 첫 발행. COLDSURF 표면들(web · server · native)이 나눠 쓰는 순수 유틸 — 렌더링이 없다.

  `paul-rockstar` 사내 패키지에 있던 날짜 유틸을 그대로 옮겨 왔다. `/date` 진입점 하나로 시작한다
  (KST 사람 표기 `parseEventDate` · UTC 일/주말 경계).

  **도메인별 서브패스로 여는 게 이 패키지의 형태다.** 루트 배럴에 DOM·React 를 무는 유틸을 올리면
  DOM lib 없이 도는 소비자(Fastify 서버 등)의 타입체크가 그 유틸을 쓰지 않아도 깨진다. 배럴에는
  환경 중립만 올리고, 나머지는 진입점을 가른다.

  날짜 라이브러리(`date-fns` · `date-fns-tz`)는 **optional peer** 다. `date-fns` 만 38MB 라
  `/date` 를 안 쓰는 소비처에 얹지 않는다 — `/date` 를 쓰면 소비처가 직접 설치한다.
