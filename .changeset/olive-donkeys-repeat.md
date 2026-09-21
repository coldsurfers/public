---
'@coldsurfers/design-system': minor
---

`ConcertCard` 의 `cover` 섀시에 크기 축(`size`) 추가 — `full`(기본, 현행) · `compact`.
그리고 섀시들을 정적 프로퍼티로 냈다 — `ConcertCard.Framed` · `ConcertCard.Bare` ·
`ConcertCard.Cover` · `ConcertCard.CoverCompact`.

`compact` 는 날짜 · 제목 · 공연장 셋을 다 커버 안 하단에 넣고 스크림을 카드 전체 높이에 건다.
작은 칸(랜딩 · 그리드)에서 커버 밖에 메타 한 줄을 더 두면 카드가 두 덩어리로 갈라져 보인다.

정적 프로퍼티는 평평한 `ConcertCardProps` 가 세 섀시의 축을 합집합으로 들고 있는 걸 푼다.
`cover` 에 `matchLabel` 을 줘도 타입이 통과했고, 반대로 `initial` 은 그 섀시가 아무 데도 안
그리는데 **필수**라 소비처가 안 쓰일 자모를 지어내야 했다. 섀시별 문으로 들어오면 `Pick` 이
소비처까지 닿는다 — 네 props 타입(`FramedConcertCardProps` · `BareConcertCardProps` ·
`CoverConcertCardProps` · `CoverCompactConcertCardProps`)도 `cards` 진입점에서 같이 나간다.

**문은 넷인데 섀시는 셋이다.** 커버만 크기로 갈라 냈다 — `size` 는 크기 플래그처럼 생겼지만
`compact` 에서만 `footer` 가 그려지는 **슬롯 축**이라, 한 문에 플래그로 두면 `full` 쪽 `footer`
가 `initial` 과 같은 병(있는데 안 먹는 prop)에 걸린다. 크기를 문 이름에 박으면 플래그가 바깥에서
사라져 그 병이 성립하지 않는다 — `ConcertCard.Cover` 에 `footer` 를 넘기면 컴파일 에러다.

`variant` 는 그대로다 — 새 축은 `cover` 섀시 안의 prop 이고 정적 프로퍼티는 옆에 문을 더 단
것이라 문 이름이 안 바뀐다. `ConcertCardProps.size` 도 남는다. 두 체계가 공존한다: `variant`
문은 관대하고(합집합·조용한 무시) 정적 프로퍼티 문은 정확하다(그 섀시가 그리는 것만).
기본값이 `full` 이라 기존 `cover` 소비처의 렌더 결과는 그대로다.
