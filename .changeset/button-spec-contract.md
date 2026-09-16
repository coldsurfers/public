---
'@coldsurfers/design-system': patch
---

`Button` 의 치수·variant 색 표를 `contract/button.ts` 의 `BUTTON_SPEC` 으로 모은다.

웹 recipe(`Button.css.ts`)와 RN 구현에 같은 값이 두 벌 적혀 있었고 담보가 주석 한 줄이었다.
이제 양쪽이 한 표를 각자의 토큰 맵으로 읽는다. 산출 CSS 는 바이트 단위로 동일하다.

RN 두 구현이 같이 쓰는 표면 계산은 `native/button-style.ts` 로 뺀다 — 진입점이 아닌 모듈이라
`exports` 맵에 오르지 않고, `native/IconButton` 이 `native/Button` 을 통째로 물지도 않는다.
공개 API 는 그대로다.
