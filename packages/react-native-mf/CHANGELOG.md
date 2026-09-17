# @coldsurfers/react-native-mf

## 0.4.0

### Minor Changes

- [#172](https://github.com/coldsurfers/public/pull/172) [`a13a4d5`](https://github.com/coldsurfers/public/commit/a13a4d5a2e07989f30efd6418557f20e07afb09f) Thanks [@yungblud](https://github.com/yungblud)! - `build` 커맨드를 연다 — 미니앱 소스 트리를 원격 번들 한 장으로 굽는다.

  babel transpile(미니앱 자기 config) → esbuild 번들(shared 치환 + self-register) →
  Hermes 용 block-scoping 후처리 셋이 한 명령으로 돈다. `sharedScopePlugin` ·
  `withSelfRegister` 를 손으로 얹던 `build.mjs` 가 필요 없어진다.

  - shared 목록은 **호스트가 내놓은 매니페스트에서 읽는다** — `--shared-from <path>`. 호스트의
    `registerShared` 키 배열을 주면 치환 필터(패키지 이름)를 CLI 가 파생한다. 미니앱은 목록을
    들지 않는다 — 들면 정본이 둘이 되고, 갈라진 자리가 에러가 아니라 **번들 안의 사본**으로 나온다
  - 직접 적는 `--shared` 도 남는다. 반복하거나 쉼표로 잇는다. 둘을 같이 쓰면 거절한다
  - babel config 는 **미니앱 것**을 쓴다. 이 패키지는 RN 프리셋을 들지 않는다
  - block-scoping 후처리는 `--no-block-scoping` 으로 끌 수 있다
  - `@babel/core` · `@babel/plugin-transform-block-scoping` 이 **optional peer** 로 늘었다.
    `esbuild` 와 같은 축이고, CLI 를 실제로 부를 때만 열린다
  - `./cli` 의 `run` 이 `number` 에서 `Promise<number>` 가 됐다. 빌드가 비동기라 종료 코드를
    기다려야 한다

## 0.3.1

### Patch Changes

- [#170](https://github.com/coldsurfers/public/pull/170) [`cdfabff`](https://github.com/coldsurfers/public/commit/cdfabff79434034f2b7af0242934600c81163f57) Thanks [@yungblud](https://github.com/yungblud)! - `useRemote` 의 로드 실패가 무한 루프가 되던 것을 고친다

  React 는 렌더에서 던져진 약속의 상태를 보지 않는다. 그래서 실패를 기억하지 않는 `load` 를
  매 렌더 그대로 던지면 거절 → 재렌더 → 새 로드가 끝없이 돈다 — 오프라인에서 네트워크를 계속
  때리고 ErrorBoundary 는 한 번도 안 불렸다(실측: 렌더 21+ · fetch 5).

  이제 정착한 실패를 기억했다가 다음 렌더에 **에러로** 던진다(렌더 5 · fetch 1 · 경계가 받는다).
  지우는 건 새로 낸 `resetRemote(name)` 뿐이다 — 던지며 비우면 React 의 에러 복구 렌더가 새
  로드를 시작해 루프가 그대로 이어진다. react-query 의 `QueryErrorResetBoundary` 와 같은 모양이다.

  ```tsx
  <ErrorBoundary onReset={() => resetRemote('settings')} FallbackComponent={...}>
  ```

## 0.3.0

### Minor Changes

- [#168](https://github.com/coldsurfers/public/pull/168) [`3ab4ae1`](https://github.com/coldsurfers/public/commit/3ab4ae10540ee8c06db0d7d213090694ebf5b5a6) Thanks [@yungblud](https://github.com/yungblud)! - 로더 표면 `scriptManager` 를 런타임 레인에 추가한다 (Phase 1.5)

  원격 번들을 받아 실행하는 일을 React 수명주기 밖으로 뺀다. resolver 한 자리에서 dev/prod ·
  채널 · 롤백이 갈리고, `load` 는 in-flight 를 접으며 **이미 레지스트리에 있으면 재실행하지
  않는다** — 두 번째 실행이 미니앱 top-level 의 `new QueryClient` 를 다시 만들던 자리다.

  캐시는 `ScriptStorage` 인터페이스 뒤에 둔다. `fetch` 는 이 패키지가 들고 저장만 주입받아서,
  공개 패키지가 `react-native-fs` 같은 네이티브 모듈을 물지 않는다. `invalidate({ keep })` 가
  옛 버전 파일을 정리한다.

  Suspense 어댑터 `useRemote` 도 같이 낸다. React 를 import 하지 않아 peer 는 늘지 않는다 —
  훅 API 를 부르지 않고 "있으면 값, 없으면 약속을 던진다" 만 한다.

  배럴(`.`)에 재수출한다 — 새 진입점을 열지 않는다. 순수 추가다.

## 0.2.1

### Patch Changes

- [#164](https://github.com/coldsurfers/public/pull/164) [`cedabd7`](https://github.com/coldsurfers/public/commit/cedabd7f4e78c7f06d9a14c5584cf0935ccd46a4) Thanks [@yungblud](https://github.com/yungblud)! - - `./cli` 를 **import 만 해도** `process.exitCode` 가 1 이 되고 stdout 에 usage 가 찍히던 것을
  고친다. 이 모듈은 bin 이면서 동시에 `exports` 맵의 진입점이라, 최상단 실행이 `run` 을
  가져다 쓰려던 프로세스를 실패로 끝냈다. bin 으로 불렸을 때만 실행한다.
  - README 의 회수 예제가 틀렸다. 등록되는 값은 **모듈 네임스페이스**라 `export default` 를 쓴
    미니앱은 `.default` 로 한 겹 더 들어가야 한다 — 코드·주석·테스트는 맞았고 README 만 어긋나 있었다.
  - 전역 레코드를 지연 생성하는 같은 12줄이 `registry` 와 `shared-scope` 에 두 벌 있었고 존재
    판정이 갈려 있었다(`in` ↔ `!== undefined`). 식을 한 곳으로 모으고 판정을 맞춘다.

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
