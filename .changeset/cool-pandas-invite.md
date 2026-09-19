---
'@coldsurfers/design-system': minor
---

원색층 `--cs-*` 추가 · `ink` RN 노출 수정 · shadow/gradient 축 신설

**의미이름(`--bg`·`--text`·…)은 하나도 바뀌지 않았다.** 값도 전부 그대로다 — 소비처 수정이 필요 없다.

- **`palette` 그룹 신설** — COLDSURF 원색 19색을 `--cs-*` 로 발행한다(`--cs-deep-night` 등).
  `light` 와 `ink` 가 이제 전부 여기서 파생하므로 hex 정본이 한 군데다.
  역할 이름이 안 붙는 자리(그라디언트 정지색·타일 바닥·내비 글자)의 탈출구이고,
  **의미이름이 있는 자리에 쓰는 것이 아니다.** 설계 근거는 `docs/palette-layer.md`.
- **`ink` 배선 수정** — `tokens` 집계 객체에 빠져 있어 `tokens/native.ts` 에 안 실렸다.
  그래서 **RN 이 다크 밴드 색 넷을 읽을 수 없었다.** 값 추가 없이 배선만 고쳤고,
  `native.ts` 가 `ink` 와 `palette` 를 재수출한다.
- **`shadow` 그룹 신설** — `Popover`·`Modal`·`Toast` 가 각자 들고 있던 boxShadow 리터럴 셋을
  깊이 축 하나로 접고 `shadow.accent` 를 더했다. **값은 정규화하지 않았다**(시각 회귀 0).
  `Checkbox` 의 포커스 링은 깊이가 아니라 포커스 축이라 그대로 뒀다.
- **`gradient` 그룹 신설** — 표면 그라디언트 6종. 데이터로 정해지는 `cover` 와 다른 축이다.
- **`radius` 에 `2xl`(16px)·`3xl`(24px)** — 천장이 12px 이라 큰 카드·패널이 리터럴로 새고 있었다.
  눈금이 이어지는 둘만 넣었다. 반응형 짝(14→16·20→24·24→28)은 합성 슬롯이라 P3 으로 넘긴다.

`@coldsurfers/tailwind4-theme` 는 그룹을 명시적으로 호출하므로 새 그룹이 자동 노출되지 않는다 —
Tailwind 에 뚫을지는 별도 결정이다.
