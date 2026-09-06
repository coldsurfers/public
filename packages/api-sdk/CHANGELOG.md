# @coldsurfers/api-sdk

## 4.2.0

### Minor Changes

- [#83](https://github.com/coldsurfers/public/pull/83) [`7d21eca`](https://github.com/coldsurfers/public/commit/7d21eca05bf106047f1aed6211e2cc5e1393085d) Thanks [@yungblud](https://github.com/yungblud)! - `components['schemas']['DetailImageDTOSchema']` 가 생긴다.

  이 DTO 는 서버 라우트가 직접 물지 않는다 — `EventDetailDTOSchema` 안에 중첩돼 있을 뿐이라 문서에
  통째로 인라인되고 이름이 남지 않았다. 그런데 billets-app 은 상세 이미지 리스트 3곳에서 이 DTO 를
  _타입으로 직접_ 물어서, 이름이 없으면 그쪽이 컴파일되지 않는다.

  서버(`paul-rockstar#381`)가 `openAPIRegistry.register()` 로 이름표를 남기게 했고 스펙을 다시 떴다.
  **순수 추가 1건** — 스키마 90→91, 경로 110개와 기존 스키마는 한 글자도 바뀌지 않는다.

## 4.1.0

### Minor Changes

- [#79](https://github.com/coldsurfers/public/pull/79) [`b4ad13e`](https://github.com/coldsurfers/public/commit/b4ad13ebe8f1c9a1b410b05ba940e5b968a389b2) Thanks [@yungblud](https://github.com/yungblud)! - ticket.getTicketsByEventId 가 Hono 서버의 `/v2/events/{eventId}/tickets` 를 부른다.

  메서드 시그니처와 응답 타입은 그대로다 — 부르는 경로만 바뀐다.
  `api.coldsurf.io`·`api.billets.coldsurf.io` 둘 다 이 경로를 서빙하므로 baseUrl 이 어느 쪽이든 동작한다.
  legacy 스펙에서 `/v1/ticket/` 이 빠졌다(8→7경로).

## 4.0.0

### Major Changes

- [#77](https://github.com/coldsurfers/public/pull/77) [`3215944`](https://github.com/coldsurfers/public/commit/3215944810ba923f5eaef986e5e5b5babccec6d4) Thanks [@yungblud](https://github.com/yungblud)! - 계약 정본을 billets-server(Hono on Workers, `api.coldsurf.io`)의 스펙으로 옮긴다.

  지금까지 `openapi.json` 은 Fastify 시절 산출물(`ColdSurf API` · 142경로 · 208스키마)이었다. 현재 서버가 그리는 문서가 아니어서, `api.coldsurf.io` 를 무는 소비자는 **다른 서버의 타입을 보고** 컴파일되고 있었다.

  - `openapi.json` 을 Hono 스펙(110경로 · 90스키마)으로 교체하고 `api.gen.ts` 재생성
  - 아직 Hono 로 안 옮겨진 잔여 계약은 `legacy-openapi.json`(8경로 · 12스키마)으로 분리해 `legacy.gen.ts` 를 따로 굽는다. auth 6 · `/v1/ticket/` · `/v2/events/upload-tokens` — 소비처가 옮겨가면 줄다가 사라진다
  - **삭제(breaking): `mailer` · `partner` · `price` 네임스페이스.** 전 레포 호출처 0곳이고 Hono 에도 대응 라우트가 없다
  - 트레일링 슬래시 정리 — 서버가 `strict: false` 라 런타임은 같지만 문서 경로는 슬래시가 없다

## 3.0.0

### Major Changes

- [#72](https://github.com/coldsurfers/public/pull/72) [`e90eb49`](https://github.com/coldsurfers/public/commit/e90eb4968ecc64c85fc8f9b77783503cf841bd44) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/api-sdk` 를 public 레포로 옮기고 **소스가 아니라 `dist` 를 발행한다.**

  진입점을 **의존성 경계**로 다시 그었다 — 루트 `.` 이 react-query 를 런타임으로 물고 있어서, DTO 타입 하나 쓰려는 소비자가 UI 런타임까지 지고 있었다.

  | 진입점      | 내용                                                                        | peer                                |
  | ----------- | --------------------------------------------------------------------------- | ----------------------------------- |
  | `.`         | `types/*` · `ApiSdk` · `getApiClient` · `OpenApiError`                      | `openapi-fetch`                     |
  | `./react`   | `createPageQueries` · `createSuspenseCursorInfiniteQuery` · providers · hoc | + `react` · `@tanstack/react-query` |
  | `./queries` | 도메인 훅 (feed · notification)                                             | + 위                                |
  | `./client`  | 웹 auth 미들웨어                                                            | `openapi-fetch`                     |

  **breaking**

  - `./providers` · `./hoc` → `./react` 로 합쳤다
  - `./next` 제거 — 실사용 0곳
  - `./client/native` 제거 — `@coldsurfers/native-auth`(비공개)를 물어서 공개 패키지가 될 수 없다
  - `ts-pattern` peer 제거 (호출 1곳을 평문 분기로)
  - `FeedBlogArticleDTOSchema` → `FeedEditorialDTOSchema` (`BLOG_ARTICLE` → `EDITORIAL`)
