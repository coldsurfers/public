---
'@coldsurfers/design-system': minor
---

`ConcertCard`(`bare`)에 커버 비율 축을 연다 — `coverRatio?: 'landscape' | 'square'`, 기본
`landscape`(4:3)라 기존 소비처는 바뀌지 않는다.

`CONCERT_CARD_BARE_SPEC.coverAspectRatio` 가 단일 숫자에서 축별 표로 바뀌었고, 웹은
`bareCoverRatio` variants 로 RN 은 `styled` 에서 같은 표를 읽는다. 임의 비율을 prop 으로 받지
않는 이유: 커버는 카드 정체성이라 지면마다 다른 비율이 생기면 같은 카드로 안 보인다.

`square` 를 여는 자리는 billets-app 홈 레일 시안(정사각 146×146)이다.
