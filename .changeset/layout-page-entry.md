---
'@coldsurfers/design-system': minor
---

`./layout` 진입점 추가 — 표면 레이아웃 `Page` · `Container`.

seed-design 의 `AppScreen`(stackflow) 이 모바일 스택 화면에 하는 일을 웹 문서 표면으로 옮긴 것.
`Page` 는 `min-height:100vh` 세로 스택 + `data-surface` 마커 + 표면 스타일 주입구(`style`),
`Page.Content` 는 `<main>` + `flex:1` 로 짝을 이룬다. `Container` 가 gutter 정본
(`max-width:1440px` · `padding-inline` 6/16).

상·하단 chrome 은 슬롯 래퍼 없이 `Page` 의 자식으로 놓는다 — 헤더/푸터 내용물과 표면 팔레트는
소비 앱의 것이다. 근거·결정 로그: coldsurfers/public#19

`Container` 는 `as` 로 태그를 고른다(`div` 기본 · `section`/`main`/`aside`/`header`/`footer`).
gutter 는 정렬축이지 의미가 아니라서, 같은 세로선에 서는 것들이 표면 안에서 `<section>`·`<div>`·
`<main>` 으로 갈린다 — 실측 web-next 34곳 중 26곳이 `<section>` 이다.
