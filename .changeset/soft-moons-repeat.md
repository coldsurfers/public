---
'@coldsurfers/design-system': minor
---

`Modal` 에 `placement` 축을 연다 — `center`(기본) · `top` · `bottom`. `bottom` 이 바텀시트 자리다.

소비처 실측 5곳 중 4곳이 `sprinkles({ alignItems: 'center', justifyContent: 'center' })` 를 문자 그대로 복붙하고 있었다. 축이 없던 게 아니라 기본값이 없었다. 기존 소비처는 기본값 `center` 로 픽셀이 그대로다.

오버레이의 `padding` 이 base 에서 placement variant 로 내려갔다 — `bottom` 만 0 이라 base 에 두고 덮으면 같은 레이어 안 소스 순서에 기대는 규칙이 된다.
