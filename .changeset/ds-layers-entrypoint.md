---
'@coldsurfers/design-system': minor
---

`./layers` 진입점 추가 — `@layer` 이름과 `LAYER_ORDER` 만 담고 CSS 를 안 문다.

배럴(`.`)은 `styles.css` 를 물어서 번들러 없는 Node 에서 열리지 않는다(`Unknown file extension ".css"`). 순서를 검사하는 쪽이 대개 그 자리다 — 소비 레포의 pre-push 게이트가 `LAYER_ORDER` 를 읽어 상대 순서를 본다. `./tokens`·`./style-utils` 와 같은 규율(값만 필요한 소비자는 CSS 를 지불하지 않는다)의 넷째 진입점.

배럴은 같은 다섯 이름을 그대로 재수출한다 — 기존 소비자에 변화 없음.
