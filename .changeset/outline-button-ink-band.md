---
'@coldsurfers/design-system': minor
---

`Button variant="outline"` 의 바탕을 `white` 리터럴에서 `surface` 토큰으로 옮긴다.

라이트 스킴에서 `surface` 는 `#ffffff` 라 **기존 표면의 시각 변화는 없다.** 달라지는 건
스킴을 스코프로 뒤집은 서브트리다 — 라이트 페이지 안에서 한 구간만 어둡게 눕는 잉크 밴드
(랜딩 헤더·히어로)에서 outline 버튼이 흰 알약으로 남고, `label: 'text'` 는 제대로 뒤집혀
흰 글자가 되어 **흰 바탕에 흰 글자**가 됐다.

`white` 리터럴은 `accent`·`danger` 의 *라벨*에만 남는다. 그 둘은 자기 바탕을 리터럴로 깔고
앉으므로 글자도 같이 고정되는 게 맞다. 계약이 웹·네이티브 공용이라 RN `Button` 도 같이 따른다.
