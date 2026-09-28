---
"@coldsurfers/api-sdk": minor
---

동네(Area) 경로 4개 추가(`/v2/areas` · `/v2/areas/slug/{slug}` · `/v2/areas/requests` · `/v2/users/me/area`)와 billets-server 계약 전체 재동기화. 서버에서 #427 로 폐기된 `/v1/survey/count` 와 `survey.voteColdsurfTicket` 래퍼를 제거한다 — 이미 404 라 깨질 호출이 없다.
