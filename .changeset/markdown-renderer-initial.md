---
'@coldsurfers/markdown-renderer': minor
---

첫 발행. 마크다운 → COLDSURF 산문 표면(shiki 하이라이팅 · 미디어 임베드 · 이미지 라이트박스).

`@coldsurfers/design-system` 에 얹지 않고 패키지를 가른 이유는 무게다. shiki 는 모듈 최상단
부수효과(`createHighlighterCoreSync()`)라 번들러가 못 털고, DS 는 `cssCodeSplit: false` 라
CSS 가 한 장이어서 산문 CSS 470 줄이 안 쓰는 소비자에게도 실린다. 갈라 두면 import 안 한
소비자에겐 0 바이트다.

무거운 의존(shiki · react-markdown · remark/rehype)은 번들에 넣지 않는다 — dist 는 28 kB.
스타일시트는 DS 것과 **둘 다** 물어야 한다.
