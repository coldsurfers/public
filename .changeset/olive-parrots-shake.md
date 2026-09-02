---
'@coldsurfers/design-system': minor
---

`./primitives` 에 `Skeleton` 을 추가한다.

로딩 자리표시자를 한 어휘로 묶는다. 치수는 단일값 props(`width`·`height`·`aspectRatio`)로 받고,
`@media` 분기는 `className` 이 맡는다. 바탕은 `neutral`·`onCover` 두 톤이고 `aria-hidden` 은
기본으로 박힌다. 이미 치수를 가진 스타일 위에 맥동만 얹는 자리는 `asChild`.

`cards/ConcertCardSkeleton` 의 `barBase` 는 같은 톤 소스(`skeletonToneValue.neutral`)를 읽는다 —
값은 그대로라 시각 변화는 없다.
