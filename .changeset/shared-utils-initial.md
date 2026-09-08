---
'@coldsurfers/shared-utils': minor
---

첫 발행. COLDSURF 표면들(web · server · native)이 나눠 쓰는 순수 유틸 — 렌더링이 없다.

`paul-rockstar` 사내 패키지에 있던 날짜 유틸을 그대로 옮겨 왔다. `/date` 진입점 하나로 시작한다
(KST 사람 표기 `parseEventDate` · UTC 일/주말 경계).

**도메인별 서브패스로 여는 게 이 패키지의 형태다.** 루트 배럴에 DOM·React 를 무는 유틸을 올리면
DOM lib 없이 도는 소비자(Fastify 서버 등)의 타입체크가 그 유틸을 쓰지 않아도 깨진다. 배럴에는
환경 중립만 올리고, 나머지는 진입점을 가른다.

날짜 라이브러리(`date-fns` · `date-fns-tz`)는 **optional peer** 다. `date-fns` 만 38MB 라
`/date` 를 안 쓰는 소비처에 얹지 않는다 — `/date` 를 쓰면 소비처가 직접 설치한다.
