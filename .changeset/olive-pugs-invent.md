---
'@coldsurfers/design-system': minor
---

`ConcertCard` 의 커버 섀시에 크기 하나를 더 낸다 — `ConcertCard.CoverLarge`(= `size="large"`,
420/460 · 여백 24). `CoverCompact` 와 **같은 그림**이고 치수만 다르다.

여는 자리는 **여러 열 그리드**다. 칸이 420px 폭쯤 되면 `CoverCompact` 높이(300)로는 칸이 가로로
누워 세로 포스터의 상하단이 크게 잘린다. 레일처럼 칸이 좁은 자리는 `CoverCompact` 가 맞다.

문이 다섯인데 섀시는 여전히 셋이다. `CoverCompact` 와 `CoverLarge` 사이는 슬롯이 같아 진짜
크기 축이라 플래그로 둬도 거짓말을 안 하지만, 그러면 커버 문만 플래그를 되받아 규율이 반쪽이
된다 — 소비처가 「커버는 문으로 고른다」 하나만 외우면 되게 둔다.

`CoverLargeConcertCardProps` 도 `cards` 진입점에서 함께 나간다(`CoverCompact` 쪽 별칭).
기존 `full`·`compact` 의 렌더 결과는 바뀌지 않는다.
