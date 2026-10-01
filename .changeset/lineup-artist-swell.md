---
"@coldsurfers/data-models": patch
---

`EventDetailDTO` 의 `artists[]` 를 `LineupArtistDTO` 로 넓힌다(paul-rockstar#528 Swell alert). `ArtistDTO` 에 `nameKo` · `nameEn` · `swellTier`(`SwellTierDTO` = `CALM | MID | BIG`) · `upcomingCount` · `nextDate` 를 얹는다. `upcomingCount`·`nextDate` 는 지금 보는 공연을 뺀 예정 무대 기준.

- 새 필드는 전부 optional — 기존 응답·소비자는 그대로 통과한다
- 공용 `ArtistDTO` 와 다른 엔드포인트는 바뀌지 않는다
