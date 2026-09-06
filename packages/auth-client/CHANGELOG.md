# @coldsurfers/auth-client

## 0.4.0

### Minor Changes

- [#81](https://github.com/coldsurfers/public/pull/81) [`4bfdc63`](https://github.com/coldsurfers/public/commit/4bfdc6307da9b3f71546bc4421c532aa4938b14c) Thanks [@yungblud](https://github.com/yungblud)! - `session.refresh()` 추가 — 재발급만 따로 트리거한다.

  auth 가 아닌 _다른 서버_(billets API) 의 401 을 받은 호출자를 위한 자리다. 지금까지 재발급 절차는
  `HttpClient` 안에 private 으로 갇혀 있어서, 그런 호출자는 경로·저장·실패 시 정리를 각자 다시 짜야 했다.
  `HttpClient.refreshInFlight` 를 공유하므로 동시에 몇 번을 불러도 요청은 한 번이고, 성공 시 새 토큰이
  storage 에 이미 저장돼 있다.

  곁들여 이 패키지가 `coldsurfers/public` 으로 옮겨왔고 **발행 형태가 raw `src` → 빌드본 `dist`** 로 바뀐다.
  소비처가 `transpilePackages` 같은 설정을 지지 않아도 된다.

## 0.2.0

### Minor Changes

- [`fc0773e`](https://github.com/coldsurfers/paul-rockstar/commit/fc0773eeb84e9e38ffc7165931fec35fbc9a745b) Thanks [@yungblud](https://github.com/yungblud)! - Apple provider 에 `buildRedirectUrl` + `exchangeCode` 백필. Google provider 와 비대칭 (Google 은 둘 다, Apple 은 `signin`·`signup` 뿐) 해소. Phase D (hosted auth portal `auth.coldsurf.io`) 의 _선조건_ — portal 의 server 가 Apple OAuth 의 authorize URL 조립과 Authorization Code → token 교환을 SDK 한 점에서 수행할 수 있어야 함.

  - `AppleProvider.buildRedirectUrl(opts)` — `https://appleid.apple.com/auth/authorize` URL 조립. 기본 `response_type=code`, `response_mode=form_post`, `scope='name email'` (Apple 권장). scope 빈 문자열 명시 시 파라미터 생략.
  - `AppleProvider.exchangeCode(opts)` — Apple token endpoint 에 `application/x-www-form-urlencoded` POST. `clientSecret` 은 _consumer 가 동적 생성_ 한 ES256 JWT (Apple private key 보호 영역 — Google 의 정적 client_secret 과 다름). 네트워크 실패 → `SDK_NETWORK_ERROR`, non-2xx → `SDK_PROVIDER_ERROR`.
  - 신규 type export: `AppleRedirectOptions`, `AppleExchangeOptions`, `AppleExchangeResponse`.
  - 기존 `signin`·`signup` API 변경 없음. 추가만.

  검증 — `pnpm --filter @coldsurfers/auth-client test` 10/10 (Apple 7 신규 + 기존 3) · `check:type` 통과.

## 0.1.1

### Patch Changes

- [#55](https://github.com/coldsurfers/paul-rockstar/pull/55) [`0052eed`](https://github.com/coldsurfers/paul-rockstar/commit/0052eeda6a410b2fffefa2efb0a63b4c67dcd613) Thanks [@yungblud](https://github.com/yungblud)! - 상대 import 의 `.js` 확장자 제거 — Next.js webpack 이 `verbatimModuleSyntax` 산 출 `.js` extension 을 *.ts 소스로 resolve 하지 못해 `Module not found: Can't resolve './storage/index.js'` 빌드 에러 발생. `@coldsurfers/data-models` (sibling 패키지) 와 동일하게 *확장자 없는\* relative import 로 통일. `moduleResolution: "bundler"` 가 처리. 런타임 동작 동일.

  발견 — paul-rockstar/coldsurf-studio (Phase C) 가 첫 consumer 빌드에서 잡음.

## 0.1.0

### Minor Changes

- [#52](https://github.com/coldsurfers/paul-rockstar/pull/52) [`0d63e93`](https://github.com/coldsurfers/paul-rockstar/commit/0d63e93d2d7426c2d6e08c9023afc2804d2d57e5) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/auth-client` 첫 publish (0.1.0). `coldsurf-auth-server` 의 v1·v2·user-identity 표면 미러 + pluggable token storage (cookie · localStorage · `expo-secure-store` · memory) + 자동 refresh + 동시성 락. paul-rockstar/coldsurf-studio (Phase C) · surfers-root/billets-app·admin (Phase D) 의 단일 인증 SDK.
