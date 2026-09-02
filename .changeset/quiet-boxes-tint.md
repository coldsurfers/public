---
'@coldsurfers/design-system': minor
---

`Callout` primitive 를 연다 — 본문 흐름에 끼는 인라인 알림 상자.

`tone`(`accent`·`success`·`warning`·`danger`) 축과 `action` 슬롯. 소비처 둘이 같은 역할을 하면서
**공유하는 값이 하나도 없던** 상태를 흡수한다 — 틴트 메커니즘 둘(손수 `color-mix` vs `XBg` 토큰),
농도 둘(7% vs 14%), radius 둘(12 vs 10), padding 둘.

틴트는 **톤 전경 토큰에서 파생**한다(배경 14% · 테두리 28%). `statusSuccessBg` 를 조회하지 않는 건
`color-mix(statusSuccess 14%, transparent)` 와 수치가 같은데다, `accent` 엔 `XBg` 짝이,
테두리엔 `XBorder` 토큰이 아예 없어서다 — 조회로 통일하려면 토큰 계약을 늘려야 한다. **토큰은
건드리지 않았다.**

`role` 은 붙여주지 않는다(`...rest` 통과). 같은 상자가 읽혀야 할 때와 읽히면 방해일 때가 있고
그건 DS 가 알 수 없는 맥락이다. `margin` 도 소유하지 않는다 — 바깥 여백은 지면 몫.

근거·결정 로그 6건: coldsurfers/public#34
