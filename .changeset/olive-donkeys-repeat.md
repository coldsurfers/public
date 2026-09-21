---
'@coldsurfers/design-system': minor
---

`ConcertCard` 의 `cover` 섀시에 크기 축(`size`) 추가 — `full`(기본, 현행) · `compact`.

`compact` 는 날짜 · 제목 · 공연장 셋을 다 커버 안 하단에 넣고 스크림을 카드 전체 높이에 건다.
작은 칸(랜딩 · 그리드)에서 커버 밖에 메타 한 줄을 더 두면 카드가 두 덩어리로 갈라져 보인다.

`variant` 는 그대로다 — 새 축은 `cover` 섀시 안의 prop 이라 문 이름이 안 바뀐다.
기본값이 `full` 이라 기존 `cover` 소비처의 렌더 결과는 그대로다.
