---
'@coldsurfers/react-native-mf': patch
---

`build` 의 중간 산출물을 `node_modules/.cache/` 에서 `build/.transpiled/` 로 옮긴다.

esbuild 는 엔트리가 `node_modules/` 아래면 서드파티로 보고 최상위 `"use strict"` 를 붙이지
않는다. 미니앱 소스는 ESM 이라 명세상 strict 인데, 원격 번들은 `new Function` 으로 실행되므로
지시어가 없으면 **sloppy 모드로 돈다** — 선언 안 한 변수 할당이 전역을 만들고 함수 안 `this` 가
`undefined` 가 아니라 `globalThis` 가 된다.

실측 (0.25.7, 같은 소스·같은 옵션, 디렉터리만 다르게): `build/.probe` → `"use strict";`,
`node_modules/.cache/probe` → 없음. 0.4.0 으로 구운 번들은 이 지시어가 빠져 있다.

- 소비처는 대개 `build/` 를 이미 gitignore 한다 — 산출물(`--out-file`)이 보통 거기 떨어진다
- 회귀 테스트를 박았다. 픽스처도 `node_modules` 밖으로 옮겼다 — 안에 두면 테스트가 원인을
  못 가린다
