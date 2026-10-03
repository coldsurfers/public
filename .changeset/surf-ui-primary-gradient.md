---
"@coldsurfers/surf-ui": minor
---

주 버튼(`Button variant="accent"`)을 깊은 파랑 그라데이션으로 바꾼다 — 단색 `#2563ff` 가 사진 바닥에서 원색으로 튀었다. Figma `surf-ui / color` 에 더한 네 역할을 따른다.

- 색 역할 추가: `actionPrimaryTop` · `actionPrimaryBottom` · `actionPrimaryLine` · `actionPrimaryShadow` (`--surf-action-primary-*`)
- 웹 `accent`: 위 → 아래 그라데이션 · 1px 테두리 · 그림자 `0 8px 24px`, hover 는 밝기 1.08
- native 는 그라데이션이 없어 `actionPrimary` 단색 그대로
