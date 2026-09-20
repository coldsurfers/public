---
'@coldsurfers/design-system': minor
---

`Note` 프리미티브 · `fontFamily.geist` 추가

**`Note`** — 메타 한 줄 + 헤드라인 한 줄. 메타 10/11px ↔ 헤드라인 14/15px, 무게는 둘 다 500 하나. 위계를 크기가 아니라 여백과 순서로 만드는 규율의 압축형이다.

값은 `apps/im-coldsurf` 랜딩의 `NotePanel` **그대로**다. 그 표면이 이 톤의 정본이고 나머지가 그쪽으로 옮겨 가는 중이라 정본이 픽셀 하나도 움직이면 안 된다 — 브레이크포인트도 정본의 축(`desktop` 1024)을 따른다(정본이 "태블릿 시안이 없으므로 중간 단을 만들지 않는다"고 못박아 뒀다).

**`fontFamily.geist`** — 앱 셋(`im-coldsurf` · `web-next` · `beam-web`)이 같은 문자열을 각자 들고 있었다. 앞의 둘은 `theme.css.ts` 의 같은 줄 번호까지 같다. 원색층(`--cs-*`)을 올린 것과 같은 근거다. `sans` 와 역할이 갈린다 — 저쪽이 읽는 글이고 이쪽은 세는 글(수치·워드마크·메타).

추가만이라 기존 API 는 그대로다. 근거: coldsurfers/paul-rockstar#452 Phase 3.
