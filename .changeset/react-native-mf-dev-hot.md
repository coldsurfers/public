---
"@coldsurfers/react-native-mf": patch
---

`dev` 가 src 를 감시한다. 저장하면 바뀐 모듈만 기기로 보내 앱을 다시 띄우지 않고 갈아 끼운다. `useState` 는 남고, 모듈 최상단 싱글턴(`new QueryClient` 같은)은 그 모듈이나 그 모듈이 의존하는 모듈을 고쳤을 때만 다시 만들어진다. 규칙은 Metro 의 Fast Refresh 와 같다 — 바뀐 모듈에서 컴포넌트만 내보내는 모듈(refresh 경계)까지 다시 돌고, 경계 없이 엔트리에 닿으면 앱을 다시 띄운다. 호스트 배선(`createDevResolver` 한 줄)은 그대로다. 갱신을 받는 코드는 dev 번들에 실려 온다. `dev` 는 띄우자마자 첫 굽기를 돌려서 babel 콜드 스타트가 첫 요청에 실리지 않는다. 굽기가 실패하면 기기는 고칠 때까지 마지막 성공 코드로 돈다.
