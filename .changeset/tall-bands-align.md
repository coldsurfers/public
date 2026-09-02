---
'@coldsurfers/design-system': minor
---

`./layout` 에 `PageBanner` 를 추가한다 — 다크 풀블리드 밴드(바닥 · 셸 · `Title`/`Body` 타이포).

가로축은 `Container` 가 그대로 든다. 소비처 둘이 `max-width:1440px` + gutter 를 각자 다시
선언하다 브레이크포인트가 갈렸던 게(tablet vs desktop) 발단이라, 새 셸을 만들지 않고
`Container` 위에 세로 여백만 얹는다.

`align` 축은 열지 않았다 — 두 소비처의 정렬이 다르지만 각 정렬의 실사용이 1곳씩이라 추출할
중복이 없다. 배치는 `children` 이 정한다. 근거·결정 로그: coldsurfers/public#33
