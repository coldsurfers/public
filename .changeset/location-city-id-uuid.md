---
'@coldsurfers/data-models': patch
---

`locationCityId` 에서 `uuid()` 검사를 뗀다 — 서버가 자기가 발급한 id 를 거부하고 있었다.

`LocationCity` 두 행(`jeollanam-do` · `jeollabuk-do`)의 id 가 RFC 4122 **variant** 자리를
벗어나 있다. 모양은 `8-4-4-4-12` 라 UUID 처럼 보이지만, 17번째 hex 자리의 상위 2비트가
`10` 이어야 하는데 각각 `01`(`6a3d`) · `00`(`3f0c`) 이다.

zod v3 의 `.uuid()` 는 모양만 봐서 통과시켰고 **v4 가 RFC 검사로 조이면서** 드러났다.
billets-server 는 zod 4 라 `GET /v2/events?locationCityId=…` 가 그 두 도시에서만 400 을
뱉는다 — 같은 서버의 `GET /v1/location/country` 가 방금 내준 값인데도.

원인은 계약의 비대칭이다. 같은 패키지 `location.dto.ts` 는 이 id 를 **내보낼 때**
`z.string()` 으로 두는데 받을 때만 `.uuid()` 였다. 나가는 문은 열고 들어오는 문만 잠근 꼴이라,
맞춰야 할 쪽은 받는 쪽이다.

푼 자리는 넷, 전부 **들어오는** 값이다 — 응답 스키마는 하나도 건드리지 않았다.

- `GetEventsQueryStringDTOSchema` — 목록 조회
- `GetRecommendedEventsQueryStringDTOSchema` — 추천 목록
- `BaseDraftEventDataDTOSchema` — 드래프트 저장
- `FindManyConcertDTOSchema` — repository 입력

추론된 타입은 넷 다 `string` 그대로라 소비처의 타입은 바뀌지 않는다. 형식 검증이 막아주던
것도 실질적으로 없었다 — 값은 파라미터 바인딩으로 조회에만 들어가고, 틀리면 0건이다.

id 값 자체를 고치는 건 이 변경의 몫이 아니다. 앱이 `cityId` 를 기기에 저장하므로,
**DB 의 PK 를 바꿔도 이미 옛 id 를 들고 있는 기기는 살아나지 않는다** — 그쪽을 되살리는 건
이 완화뿐이다. 데이터 정리는 별건으로 둔다.
