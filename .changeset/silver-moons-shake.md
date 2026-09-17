---
'@coldsurfers/react-native-mf': patch
---

`useRemote` 의 로드 실패가 무한 루프가 되던 것을 고친다

React 는 렌더에서 던져진 약속의 상태를 보지 않는다. 그래서 실패를 기억하지 않는 `load` 를
매 렌더 그대로 던지면 거절 → 재렌더 → 새 로드가 끝없이 돈다 — 오프라인에서 네트워크를 계속
때리고 ErrorBoundary 는 한 번도 안 불렸다(실측: 렌더 21+ · fetch 5).

이제 정착한 실패를 기억했다가 다음 렌더에 **에러로** 던진다(렌더 5 · fetch 1 · 경계가 받는다).
지우는 건 새로 낸 `resetRemote(name)` 뿐이다 — 던지며 비우면 React 의 에러 복구 렌더가 새
로드를 시작해 루프가 그대로 이어진다. react-query 의 `QueryErrorResetBoundary` 와 같은 모양이다.

```tsx
<ErrorBoundary onReset={() => resetRemote('settings')} FallbackComponent={...}>
```
