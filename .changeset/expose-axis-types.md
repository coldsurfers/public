---
'@coldsurfers/design-system': minor
---

웹 레인의 축 타입을 소비처가 이름으로 부를 수 있게 낸다 — native 레인이 이미 하던 것이다.

`./primitives` 는 `ButtonSize` · `ButtonVariant` · `ChipSize` · `TextTone` · `TextStyleName` 을,
`./cards` 는 `ConcertCardVariant` · `ConcertCardCoverRatio` 를, `./native` 는 `TextStyleName` 을
추가로 내보낸다. `Props['variant']` 로 짚을 수는 있었지만 `Record<…>` · `useState<…>` 자리에선
이름이 필요해서, 소비처가 유니온을 자기 쪽에 다시 적게 되는 경로였다.

덤으로 웹 `Chip` 이 `'sm' | 'md'` 를 직접 적던 것을 계약의 `ChipSize` 로 바꾼다.
