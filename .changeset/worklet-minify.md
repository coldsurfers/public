---
'@coldsurfers/design-system': patch
---

RN 워클릿이 소비 앱에서 워클릿화되지 않던 것을 고친다.

`react-native-worklets/plugin` 은 워클릿화할 콜백을 **호출부의 로컬 식별자 이름**으로 고르는데(`callee.name` → `reanimatedFunctionHooks.has(name)`), 라이브러리 빌드가 `useAnimatedStyle` 을 `c` 로 줄이면서 그 목록에 안 걸렸다. 콜백은 워클릿이 아닌 채 남고, 소비 앱 런타임에서 `[Worklets] Tried to synchronously call a Remote Function. Called "anonymous" on the UI Runtime` 로 터진다(실측: billets-app, 0.17.0).

- `build.minify: false` — 라이브러리가 minify 를 지는 건 원래도 소비자 몫을 뺏는 일이다. Metro·Hermes 가 앱 빌드에서 다시 줄인다. `cssMinify` 는 켜 둬서 `styles.css` 크기는 그대로다
- `PullToRefresh` · `PullToRefreshSpinner` · `AnimatedTabBar` 의 워클릿 콜백 8곳에 `'worklet'` 지시어를 직접 적었다 — 지시어는 이름과 무관하게 걸려서 번들 설정에 안 걸린다

타입도 `check:exports` 도 못 잡는 종류라, 원인(minify)과 재발(지시어) 둘 다 막는다.
