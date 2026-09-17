---
'@coldsurfers/react-native-mf': minor
---

`build` 커맨드를 연다 — 미니앱 소스 트리를 원격 번들 한 장으로 굽는다.

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
