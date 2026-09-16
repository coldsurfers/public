---
'@coldsurfers/design-system': minor
---

`cards/*` 넷과 로더 넷이 DOM props 를 받는다 — `id` · `data-*` · `aria-*` · `style` ·
`onMouseEnter` 등.

`primitives/*` 와 `layout/*` 는 예외 없이 `HTMLAttributes` 를 extends 하고 rest 를 펴는데
`cards` 진입점만 `className` 하나로 닫혀 있었다. 소비처가 테스트 훅이나 `id` 를 붙이려면
카드를 한 겹 더 감싸야 했다.

`ConcertCard` 만 DOM `title`(툴팁)을 받지 않는다 — 카드가 그 이름을 이미 제목 문자열로 쓴다.

native `Spinner` 도 `ViewProps` 를 받는다. 같은 레인의 `Skeleton`·`Text`·`Chip`·`Button` 은
이미 받고 있었고 이 하나만 `style` 조차 못 받았다.
