---
'@coldsurfers/design-system': minor
---

RN `Text` 도 `textStyle` 을 받는다 — 두 레인이 같은 램프 표를 읽는다.

웹이 `textStyle` 한 축으로 정리된 동안 RN 은 `size`·`weight`·`leading` 세 축이라, 같은 시안이
두 레인에서 다르게 설 수 있었다. 표(`contract/text-style.ts`)는 이미 공유 자리에 있었고 RN 이
읽기만 하면 됐다.

`tokens/native` 에 `letterSpacingFor(size, track)` 를 낸다. RN 의 자간은 `em` 이 아니라 절대
포인트라 크기와 짝을 지어야 값이 나온다 — `lineHeightFor` 와 같은 수법이다(`base`·`normal`
→ `16 × -0.02 = -0.32`). 이 변환이 생기면서 `editorialType` 의 RN 제외 사유에서 자간이 빠졌다.
남은 건 `display` 의 `clamp()` 크기뿐이다.

**기존 동작은 그대로다.** `textStyle` 은 기본값이 없고, 낱개 축(`size`·`leading`)이 주어지면
그쪽이 이긴다. 지금 기본값(`base`·`normal`)과 `textStyle="body"`(`base`·`relaxed`)의 행간이
달라서, 기본으로 깔면 이미 배포된 화면의 줄 간격이 조용히 바뀐다. 축을 뒤집는 건 major 에서 한다.
자간도 `textStyle` 을 준 경우에만 박힌다.
