---
'@coldsurfers/data-models': minor
---

산문 편 본문 블록에 `heading`(`level: 2 | 3`)과 `quote`(`cite` 선택)를 연다.

처음 네 종류만 열 때 둘은 *쓸 편이 생기면 연다* 고 미뤄뒀다. personal-site 에서 옮겨오는 산문 9편 중 5편이 소제목을, 6편이 인용을 쓴다(paul-rockstar#495). `concert` 블록 최소 1개 강제는 그대로다.

⚠️ 블록 종류를 망라하는 `switch` 가 있는 소비처는 두 분기를 채워야 타입이 통과한다. 새 블록을 담은 편은 서버가 이 버전으로 올라간 뒤에 발행한다 — 옛 스키마 서버는 `safeParse` 에 실패해 편을 버린다.
