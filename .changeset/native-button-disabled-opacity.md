---
'@coldsurfers/design-system': patch
---

`native/Button` · `native/IconButton` 의 비활성 투명도가 소비자 `style` 에 덮여 사라지던 것을 고친다.

투명도를 `style` prop 으로 얹고 있어서 `<Button style={{ marginTop: 8 }} disabled />` 처럼
`style` 을 넘기면 그 한 겹이 통째로 덮였다 — 비활성 버튼이 활성과 똑같이 보였다.
컴포넌트 기본 스타일로 옮겨서 소비자 `style` 이 이기는 것도 덮는 것도 명시적 선택이 되게 한다.
