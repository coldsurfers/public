---
"@coldsurfers/react-native-mf": patch
---

`dev` 가 내는 번들이 모듈 단위로 바뀐다. 엔트리에서 닿는 소스 파일마다 CJS 모듈 하나가 되고, 번들 앞에 그 모듈을 돌리는 런타임이 실린다. 모듈은 react-refresh 로 컴포넌트를 등록한다 — `react-refresh/babel` 은 미니앱의 `react-native` 옆에서 찾는다. 번들은 첫 모듈을 돌리기 전에 빠진 shared 키를 한꺼번에 이름 대고, 굽기에 실패하면 500 본문에 깨진 파일과 못 푼 import 를 전부 적는다. `dev` 는 띄울 때 config 의 `build` 를 한 번 풀어서, `sharedFrom` 매니페스트를 못 읽으면 첫 요청이 아니라 띄울 때 실패한다.

**build 레인도 바뀐다.** config 의 `build.babelConfig` 를 상대 경로로 적으면 이제 미니앱 루트 기준 파일로 푼다. 전에는 babel 이 모듈 이름으로 찾아서 `babel.config.cjs` 처럼 `./` 없이 적으면 `Cannot find module` 로 실패했다. `build --babel-config` 플래그는 그대로다.
