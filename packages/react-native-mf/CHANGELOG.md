# @coldsurfers/react-native-mf

## 0.2.0

### Minor Changes

- [#89](https://github.com/coldsurfers/public/pull/89) [`48ef1d7`](https://github.com/coldsurfers/public/commit/48ef1d7bdfec83d846448dc05723f0ed9800a846) Thanks [@yungblud](https://github.com/yungblud)! - `./esbuild` 레인 구현. Phase A 에서 계약만 있고 던지던 자리가 실제로 돈다.

  - `sharedScopePlugin` — 카탈로그의 shared 모듈을 `globalThis[SHARED_SCOPE_KEY][name]` 참조로
    치환한다. 치환된 번들에는 `require("react")` 가 남지 않는다. 호스트가 노출하지 않은 이름은
    로드 시점에 던진다 — 조용히 `undefined` 를 넘기지 않는다
  - `withSelfRegister` — `format: 'iife'` + `globalName` + footer 로 실행된 번들이 스스로
    `globalThis[REMOTE_REGISTRY_KEY][name]` 에 오른다. 등록되는 값은 모듈 네임스페이스 그대로다

  정확히 일치하는 이름만 치환한다. `react-native/Libraries/...` 같은 deep import 는 그대로 번들된다.

- [#90](https://github.com/coldsurfers/public/pull/90) [`69e960d`](https://github.com/coldsurfers/public/commit/69e960d990ee762364027a9fe2bfc7bd869cee2c) Thanks [@yungblud](https://github.com/yungblud)! - shared 목록의 소유권을 소비처로 넘긴다.

  - `common-dependencies.json` 삭제. 버전·사내 패키지 이름은 **호스트 앱의 사실**이라 밖으로
    나가는 패키지의 기본값에 있을 자리가 아니었다. `getSharedDependencies` ·
    `sharedDependencyNames` · `SharedDependency` 도 함께 제거한다 — `requiredVersion` ·
    `singleton` 은 아무도 읽지 않았다(버전 협상은 범위 밖)
  - 기본값은 `DEFAULT_SHARED_MODULES` 둘로 줄인다 — `react` · `react-native`.
    그 밖은 `sharedScopePlugin({ include })` 로 소비처가 넘긴다
  - 서브패스 치환을 연다. 규칙은 **esbuild 의 `external` 과 같다** — 이름 하나가 그 패키지의
    서브패스까지 덮는다(`'react'` → `react/jsx-runtime`). 형제 패키지는 안 잡는다.
    기존 `external` 목록을 그대로 옮겨올 수 있다
  - 다만 조회 키는 원격 번들이 쓴 specifier 그대로다 — 덮는다고 접히지 않는다. 호스트는
    `react/jsx-runtime` 을 **그 이름으로** `registerShared` 해야 하고, 빠뜨리면 로드 시점에
    그 이름을 대며 던진다

## 0.1.0

### Minor Changes

- [#86](https://github.com/coldsurfers/public/pull/86) [`f9c4151`](https://github.com/coldsurfers/public/commit/f9c41519b7dde6b4dbc48c79995230348b6c6bd8) Thanks [@yungblud](https://github.com/yungblud)! - 새 패키지. React Native 앱이 원격 번들을 호스트와 같은 JS 런타임에 끼워넣는 레이어다.

  Phase A(스캐폴딩) 범위 — 런타임 primitives 만 동작한다:

  - `registerShared` / `getShared` — 호스트가 자기 사본을 전역에 노출하는 shared scope.
    원격 번들이 `react` 를 자기 안에 번들해 오면 훅이 깨지는 것을 막는다
  - `registerRemote` / `getRemote` — 실행된 번들이 스스로 등록하고 호스트가 회수하는 자리.
    실행 방식(소스 eval · 바이트코드)과 무관하게 회수 지점이 한 곳으로 고정된다
  - `getSharedDependencies` — shared 의존성 카탈로그 (호스트 RN 0.87 기준)

  `./esbuild` · `./cli` 진입점은 계약만 세워져 있고 본체는 Phase 1 이다 — 부르면 던진다.
