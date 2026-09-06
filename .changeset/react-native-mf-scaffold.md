---
'@coldsurfers/react-native-mf': minor
---

새 패키지. React Native 앱이 원격 번들을 호스트와 같은 JS 런타임에 끼워넣는 레이어다.

Phase A(스캐폴딩) 범위 — 런타임 primitives 만 동작한다:

- `registerShared` / `getShared` — 호스트가 자기 사본을 전역에 노출하는 shared scope.
  원격 번들이 `react` 를 자기 안에 번들해 오면 훅이 깨지는 것을 막는다
- `registerRemote` / `getRemote` — 실행된 번들이 스스로 등록하고 호스트가 회수하는 자리.
  실행 방식(소스 eval · 바이트코드)과 무관하게 회수 지점이 한 곳으로 고정된다
- `getSharedDependencies` — shared 의존성 카탈로그 (호스트 RN 0.87 기준)

`./esbuild` · `./cli` 진입점은 계약만 세워져 있고 본체는 Phase 1 이다 — 부르면 던진다.
