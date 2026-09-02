---
'@coldsurfers/design-system': minor
---

`UnderlineTabs`/`UnderlineTab` 추가, `Chip` 에 `asChild` 추가 (coldsurfers/public#39 Phase 1)

밑줄 탭이 web-next 에 4벌 흩어져 있었다 — `VenueDetail` · `SettingsTop` · `StageSearchOverlay` ·
`DailyIndex`. 4벌이 **이미 완전히 일치하던 것**(비활성 `muted` + `:hover strong` · 활성 밑줄 2px ·
활성 굵기 700)만 컴포넌트가 들고, 갈라져 있던 건 정본을 골라 접었다.

- 여백·`gap` 은 소유하지 않는다 — 실측 4벌이 12·10·7px 에 하나는 `paddingTop` 구조, `gap` 은
  4벌 4값이다. 셸 치수는 지면이 안다는 `PageBanner`·`Callout` 규율 그대로
- `-1px` 겹침을 컴포넌트가 든다 — 없으면 밑줄이 줄 괘선 **아래로 1px 뜬다.** 4벌 중 둘이 실제로 떠 있었다
- 선택 신호는 엘리먼트가 정한다 — `asChild`(링크)면 `aria-current="page"` 를 기본으로 넣고,
  `<button>` 이면 `aria-pressed`. 라우팅 링크에 `role="tab"` 은 틀렸다(화살표 키 요구를 못 지킨다)

`Chip` 은 **스타일이 한 줄도 안 바뀐다.** `active` 의 시각 언어(반전)를 정본으로 확정하고,
필터 칩이 크롤 가능한 `<a href>` 로 나갈 수 있도록 `asChild` 만 열었다.
