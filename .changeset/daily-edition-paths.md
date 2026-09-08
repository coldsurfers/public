---
'@coldsurfers/api-sdk': minor
---

`/v1/daily` · `/v1/daily/{series}/{slug}` 두 경로가 생긴다.

COLDSURF Daily 의 편이 정적 TS 파일에서 DB `Feed` 행으로 옮겨가면서(paul-rockstar#312) 지면이
편을 API 로 읽는다. 목록은 요약만 낸다 — 편 하나가 30KB 라 본문을 실으면 1년치가 10MB 를 넘는다.

- `GET /v1/daily?series=` — `DailyEditionSummaryDTOSchema[]` (발행일 내림차순)
- `GET /v1/daily/{series}/{slug}` — `DailyEditionDataSchema` (본문 전부)

새 스키마 3종(`DailyEditionSummaryDTOSchema` · `DailyEditionDataSchema` · `DailyEditionSeriesSchema`).
함께 넓어진 기존 스키마도 전부 값 추가다 — `FeedDefinitionDTOSchema.key` 에 `DAILY_EDITION_RELEASE`,
`FeedDTOSchema` 유니온에 편 피드, `ErrorResponseDTOSchema.code` 에 `DAILY_EDITION_NOT_FOUND`.

**순수 추가** — 경로 110→112, 스키마 91→94. 지워지거나 모양이 바뀐 것은 없다.
