---
'@coldsurfers/design-system': patch
---

`ConcertCard` 의 섀시 셋을 `FramedCard`·`BareCard`·`CoverCard` 세 컴포넌트로 분해. `variant` prop 과 `ConcertCardProps` 는 그대로라 공개 표면은 동일하다(`dist/cards.d.ts` 동일). 커버 안 `space-between` 을 채우려고 넣었던 빈 `<span />` 셋은 `margin: auto` 로 대체 — 슬롯 하나가 비면 남은 하나가 제자리를 잃던 자리다.
