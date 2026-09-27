---
'@coldsurfers/design-system': minor
---

`Ticket` 에 종이 손잡이를 연다 — `ticketPaper`·`ticketEdge`·`ticketRadius`·`ticketShadow` CSS 변수와 노치를 끄는 `notch` prop. 변수는 DS 가 선언하지 않고 `fallbackVar` 로 읽어서, 소비처가 자기 클래스의 `vars` 로 넣으면 레이어·모듈 순서와 무관하게 이긴다. `ticketGround` 도 같은 방식으로 바뀐다(기본값·`style` 로 덮는 기존 사용은 그대로).
