---
'@coldsurfers/design-system': minor
---

`ConcertCardSkeleton` 에 실카드와 **1:1 짝인 문 다섯**을 낸다 — `.Framed` · `.Bare` · `.Cover` ·
`.CoverCompact` · `.CoverLarge`. 커버 쪽은 `size` 축(`ConcertCardSize`)도 함께 받는다.

축을 플래그로 넘기던 동안엔 짝을 **소비처가 기억해야** 했다. 카드만 `size="large"` 로 바꾸고
스켈레톤을 `framed` 에 두면 타입은 통과하고 화면이 로드 순간에 280 → 460 으로 튄다. 실제로 그
일이 났다. 문 이름이 짝을 말하면 그 사고가 성립하지 않는다.

커버 스켈레톤이 치수를 **옮겨 적지 않고 실카드의 `coverCover` recipe 를 그대로 가리킨다.** 원래
430/500 을 손으로 적어 둬서, 실카드에 크기가 둘 더 붙는 동안 스켈레톤만 `full` 에 남아 있었다.
이제 크기가 또 붙어도 자동으로 따라온다.

`variant`·`size`·`reserveTitleLines` prop 은 그대로 산다. 기존 소비처는 안 깨진다.
