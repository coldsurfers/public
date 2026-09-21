---
'@coldsurfers/design-system': minor
---

`ConcertCard` 의 `cover` 섀시에 크기 축(`size`) 추가 — `full`(기본, 현행) · `compact`.
그리고 섀시 셋을 정적 프로퍼티로 냈다 — `ConcertCard.Framed` · `ConcertCard.Bare` ·
`ConcertCard.Cover`.

`compact` 는 날짜 · 제목 · 공연장 셋을 다 커버 안 하단에 넣고 스크림을 카드 전체 높이에 건다.
작은 칸(랜딩 · 그리드)에서 커버 밖에 메타 한 줄을 더 두면 카드가 두 덩어리로 갈라져 보인다.

정적 프로퍼티는 평평한 `ConcertCardProps` 가 세 섀시의 축을 합집합으로 들고 있는 걸 푼다.
`cover` 에 `matchLabel` 을 줘도 타입이 통과했고, 반대로 `initial` 은 그 섀시가 아무 데도 안
그리는데 **필수**라 소비처가 안 쓰일 자모를 지어내야 했다. 섀시별 문으로 들어오면 `Pick` 이
소비처까지 닿는다 — 세 props 타입(`FramedConcertCardProps` · `BareConcertCardProps` ·
`CoverConcertCardProps`)도 `cards` 진입점에서 같이 나간다.

`variant` 는 그대로다 — 새 축은 `cover` 섀시 안의 prop 이고 정적 프로퍼티는 옆에 문을 하나 더
단 것이라 문 이름이 안 바뀐다. 기본값이 `full` 이라 기존 `cover` 소비처의 렌더 결과는 그대로다.
