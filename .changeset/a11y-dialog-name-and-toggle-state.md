---
'@coldsurfers/design-system': patch
---

접근성 비대칭 세 곳을 고친다 — 전부 타입이 통과하던 자리다.

- `native/Modal` 의 필수 `label` 이 아무 데도 안 붙고 있었다. RN 의 `Modal` 은 props 를
  네이티브 뷰로 명시 목록만 넘기고 `accessibilityLabel` 은 그 목록에 없다. 다이얼로그 이름을
  실제 표면인 패널이 들게 옮기고, 웹과 같은 prop 이름 셋(`role`·`aria-modal`·`aria-label`)을 쓴다.
- 웹 `Chip` 의 `active` 가 스크린 리더에 안 읽혔다. 색으로만 갈렸다. 토글로 쓰는 칩
  (`active` 를 넘긴 자리)에만 `aria-pressed` 를 붙인다 — RN 짝은 이미 하고 있던 일이다.
- `native/Spinner` 가 `label` 없이 쓰이면 이름 없는 `progressbar` 였다. 웹이 이미 들고 있던
  폴백을 `SPINNER_SPEC.fallbackLabel` 로 올려 두 레인이 같은 문구를 말한다.
