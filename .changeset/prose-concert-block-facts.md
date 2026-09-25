---
'@coldsurfers/data-models': minor
---

산문 편의 `concert` 블록이 slug 대신 공연 사실(`DailyConcert`)을 통째로 든다.

**⚠️ breaking** — `{ type: 'concert', slug }` → `{ type: 'concert', concert }`. 이미 발행된 산문 편은 재발행해야 파싱된다(현재 1건).

처음엔 레퍼런스(Bandcamp Daily)를 따라 body 에 id 만 두고 실물은 별도 응답에서 받는 꼴로 뒀다. 그런데 우리 읽기 면에는 그 *별도 응답*이 없어서, 표면이 티켓을 못 그리고 slug 를 글자 그대로 문단에 뱉었다(paul-rockstar#484 리뷰).

픽(`DailyPickSchema`)과 같은 축으로 맞춘다 — 사실은 발행 시점에 얼어붙고, 채우는 건 사람이 아니라 발행 파이프다.
