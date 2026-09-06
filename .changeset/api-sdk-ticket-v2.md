---
'@coldsurfers/api-sdk': minor
---

ticket.getTicketsByEventId 가 Hono 서버의 `/v2/events/{eventId}/tickets` 를 부른다.

메서드 시그니처와 응답 타입은 그대로다 — 부르는 경로만 바뀐다.
`api.coldsurf.io`·`api.billets.coldsurf.io` 둘 다 이 경로를 서빙하므로 baseUrl 이 어느 쪽이든 동작한다.
legacy 스펙에서 `/v1/ticket/` 이 빠졌다(8→7경로).
