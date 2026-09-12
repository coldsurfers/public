---
'@coldsurfers/shared-utils': minor
---

`./react` 진입점과 `useEventCallback` 을 연다.

정체성은 고정이고 몸통은 늘 최신인 콜백을 돌려준다. 매 렌더 새 함수가 오는 prop 을 렌더 흐름
밖(타이머 · 구독 · 네이티브 스케줄러 콜백)에서 불러야 할 때 쓴다.

React 19.2 의 `useEffectEvent` 를 먼저 보고, 그쪽 제약(Effect 안에서만 호출 · 다른 훅이나
컴포넌트에 넘기지 않기)에 걸리거나 peer 를 19.2 로 좁힐 수 없는 자리에 이걸 쓴다.

`react` 는 optional peer 라 이 진입점을 안 여는 소비처는 영향이 없다.
