---
'@coldsurfers/design-system': minor
---

`./native` 에 `ConcertCard` 를 낸다 — 웹 `cards/ConcertCard` 의 `bare` 섀시를 RN 으로 옮긴 것. 두 레인이 `contract/concert-card.ts` 하나를 읽는다(props · 치수 표 · variant 축)라 값이나 이름이 갈릴 수 없다. native 는 `bare` 만 구현하므로 그쪽엔 `variant` prop 이 없다.
