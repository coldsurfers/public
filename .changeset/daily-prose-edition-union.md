---
'@coldsurfers/data-models': minor
---

`/daily` 편 본문(`DailyEditionDataSchema`)을 `kind('digest'|'prose')` 판별 union 으로 쪼갠다.
`features` 안에 공연 묶음이 아니라 **글**이 본문인 편을 세우기 위한 것이고, 다이제스트 쪽
필드는 **하나도 바뀌지 않았다**(`kind` 만 얹혔다).

산문 편의 본문은 블록 배열(`DailyBlockSchema`)이다 — `paragraph`·`concert`·`image`·`divider`
4종. 레퍼런스(Bandcamp Daily `/features`)의 55블록짜리 기사를 DOM 으로 뜯어 실제로 쓰인 것이
그 넷뿐이라 그만 연다. `concert` 블록은 slug 만 들고 실물은 렌더 시점 조회로 채운다.

⚠️ **`z.preprocess` 가 앞에 붙는다.** 이미 발행된 편 38개에 `kind` 가 없고(실측 38/38),
판별자가 없으면 `discriminatedUnion` 이 디스패치 단계에서 떨어진다. 읽는 쪽은 파싱 실패한 편을
조용히 버리므로 그냥 얹으면 아카이브가 통째로 사라진다. `.default('digest')` 로는 안 구해진다 —
기본값은 디스패치 **이후에** 적용된다. 저장된 편에 `kind` 를 백필하면 이 shim 은 뗄 수 있다.
