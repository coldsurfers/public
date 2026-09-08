---
'@coldsurfers/shared-utils': minor
---

SEO 어댑터(`/metadata` · `/next` · `/seo-head`)와 `/jwt` 진입점 추가.

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
