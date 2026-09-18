---
'@coldsurfers/design-system': minor
---

브랜드 색을 warm-paper 에서 **쿨 계열로 확정한다.** 액센트가 blood orange `#d6451f` 에서
surf blue `#2563ff` 로 바뀌는 것이 이 변경의 축이고, 나머지 색은 그 축에 맞춰 따라간다.

근거는 Figma Page 16 시안 셋(입장권 14화면 · Persona Landing 데스크톱/모바일 · 이벤트 상세)이다.
warm 계열 회갈색과 쿨 계열 표면이 한 화면에서 같이 서지 않았다 — 특히 `cover` 팔레트의
초록·황토·와인이 유일한 warm 잔재로 남아 튀었다.

**대비는 깨지 않는다.** `muted` 는 읽는 글자의 하한선이라는 규율(coldsurfers/public#106)을
그대로 두고 값만 옮겼다 — surface 위 5.6:1 → **5.98:1** 로 올라간다. `accent` 도 4.3:1 →
**4.88:1** 로 올라 본문 크기에서 AA 를 넘는다. `subtle` 은 2.34:1 → 2.54:1 로 여전히
*읽히지 않아도 되는 것* 전용이다.

**`cover` 키 이름은 바꾸지 않았다.** `forest` 에 틸, `moss` 에 인디고가 들어가 이름이 값을
설명하지 못하게 되지만, `coverToneFor` 가 `Object.keys(cover)` **순서**로 결정적 분산을 하므로
키를 건드리면 이미 발행된 모든 이벤트의 커버색이 재배치된다. 이름은 색이 아니라 슬롯이고,
그 사실을 주석에 적었다.

`paper.warm` 도 같은 이유로 키를 유지한다(값은 `#fafaf7` → `#f9fbfd`). 브랜드 정본 paper
(`light.bg`)와 **다른 값**이라는 이름 사전의 규칙은 그대로다 — 둘은 여전히 구별 대상이다.

### `ink` 스케일 신설

라이트 표면 안에서 **한 구간만 눕는 다크 밴드**(헤더·히어로·캡처 밴드)가 쓰는 색 넷을
`cover`·`paper` 와 같은 성격의 스킴 불변 scale 로 낸다 — `--ink-base` · `--ink-surface` ·
`--ink-border` · `--ink-accent`.

ink(dark) **스킴**을 되살리는 것이 아니다. 전역으로 색을 뒤집는 축은 여전히 없고
(paul-rockstar #299 는 그대로), 그 구간이 쓰는 상수만 시스템 안으로 들인다. 지금은 소비처가
같은 hex 를 자기 파일에 적고 있다.

`ink.base` 는 `light.text` 와, `ink.border` 는 `light.body` 와 같은 hex 다. 이름이 겹치는 게
아니라 **역할이 둘인 값**이라 양쪽에 둔다.
