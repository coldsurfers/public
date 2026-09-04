---
'@coldsurfers/design-system': minor
---

native 레인에 컴포넌트별 진입점을 연다 — `./native/Button` 처럼.

Metro 는 tree-shaking 을 하지 않아 `./native` 배럴을 열면 9개가 전부 번들된다.
서브패스로 열면 `Button` 기준 전이 폐포가 18,044 → 6,917 B (-62%) 다.
배럴은 그대로 남으므로 기존 소비처는 바꿀 것이 없다.
