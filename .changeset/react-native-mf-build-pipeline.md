---
'@coldsurfers/react-native-mf': minor
---

`./esbuild` 레인 구현. Phase A 에서 계약만 있고 던지던 자리가 실제로 돈다.

- `sharedScopePlugin` — 카탈로그의 shared 모듈을 `globalThis[SHARED_SCOPE_KEY][name]` 참조로
  치환한다. 치환된 번들에는 `require("react")` 가 남지 않는다. 호스트가 노출하지 않은 이름은
  로드 시점에 던진다 — 조용히 `undefined` 를 넘기지 않는다
- `withSelfRegister` — `format: 'iife'` + `globalName` + footer 로 실행된 번들이 스스로
  `globalThis[REMOTE_REGISTRY_KEY][name]` 에 오른다. 등록되는 값은 모듈 네임스페이스 그대로다

정확히 일치하는 이름만 치환한다. `react-native/Libraries/...` 같은 deep import 는 그대로 번들된다.
