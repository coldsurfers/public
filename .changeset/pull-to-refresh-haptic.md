---
'@coldsurfers/design-system': minor
---

`PullToRefresh` 에 `onHapticFeedback` 을 연다 — 새로고침이 끝나 틈이 닫히기 시작하는 순간 한 번 불린다.

haptic 을 DS 가 직접 울리지 않는 건 계약 때문이다. `expo-haptics` 를 물면 Expo 를 쓰지 않는 소비처까지
그걸 깔아야 한다. 무엇을 어떤 세기로 울릴지도 화면의 맥락이라 소비처가 정한다. 선택 prop 이라 기존 소비처는 그대로다.
