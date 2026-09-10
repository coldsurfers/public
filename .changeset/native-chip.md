---
'@coldsurfers/design-system': minor
---

`./native` 에 `Chip` 을 낸다 — 웹 `primitives/Chip` 의 축(size 2 · active)을 RN 으로 옮긴 것.

치수와 색 배정은 새 `contract/chip.ts` 의 `CHIP_SPEC` 하나를 두 레인이 읽는다. 웹 `Chip.css.ts`
가 리터럴로 들고 있던 35·26·14·10 이 그 표로 올라갔고, `:hover`·`transition` 만 웹에 남는다 —
RN 엔 짝이 없어 갈라질 상대가 없다.

RN 엔 자리가 없는 셋(`as` · `asChild` · `className`)은 prop 을 두지 않았다. 있는데 안 먹는
prop 은 거짓말을 한다.
