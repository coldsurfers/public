---
'@coldsurfers/tailwind4-theme': minor
---

신규 패키지 — COLDSURF 토큰을 Tailwind v4 `@theme` 로 잇는 한 장짜리 브릿지.

`bg-bg` · `text-heading` · `bg-cover-forest` · `p-4` 가 우리 토큰 값을 쓰게 만든다. JS 는 없고
`exports` 가 가리키는 건 CSS 파일 하나다. peer 는 `tailwindcss@4` 와 `@coldsurfers/design-system`.

DS 안에 넣지 않은 이유: `@theme` 매핑은 Tailwind 소비자에게만 의미가 있는데 DS 의 `exports` 에
한번 오르면 빼는 게 major 다. 가르면 안 쓰는 쪽은 설치를 안 해 0 바이트다
(`docs/p1-boundary.md` 결정 4 개정).
