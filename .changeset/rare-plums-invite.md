---
"@coldsurfers/markdown-renderer": minor
---

`@coldsurfers/design-system` peer 를 `>=0.11.0` 으로 올린다. 그 아래 DS 는 진입점이 자기 CSS 를
물고 오지 않아, 소비자가 `styles.css` 를 손으로 물지 않으면 이 패키지의 산문 규칙이 참조할
변수가 없다. README 가 "이쪽 스타일시트만 물면 된다"고 말할 수 있는 근거가 이 범위다.
