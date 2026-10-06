---
'@coldsurfers/surf-ui': minor
---

`Page` 에 `mode: 'ink' | 'light'`(필수) — `data-surface` 로 나가고, `useSurfaceMode()` 로 내려가 `Modal` · `Popover` 오버레이가 같은 면으로 뜬다. ink 페이지면 `<body>` 도 ink 스코프를 받는다. 화면 이름은 `surface` 대신 `name`(`data-page`). ⚠️ `surface` prop 제거 — 깨지는 변경.
