---
'@coldsurfers/data-models': minor
---

`DailyEditionSummaryDTOSchema` 에 선택 칸 `author` 를 연다 — 편 본문의 글쓴이 핸들을 목록 요약에도 싣는다.

목록(`/v1/daily`) 카드가 바이라인을 그리려는데 요약에 그 칸이 없었다. 스키마가 모르는 키는 `$strip` 으로 버려져서, 소비처는 편마다 상세를 다시 읽어야 글쓴이를 알 수 있었다(paul-rockstar `getContributorEditions`). 선택 칸이라 기존 서버·클라이언트는 그대로 통과한다.
