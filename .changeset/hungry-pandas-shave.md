---
'@coldsurfers/design-system': minor
---

`EmptyState` 추가, sprinkles 에 `textAlign` 축 추가 (coldsurfers/public#42 Phase 1)

「아직 아무것도 없습니다」 자리가 web-next 에 5벌 흩어져 있었다 — `Tonight` · `NearBy` ·
`ThisWeekend` · `NotificationsSurface` · `WorkSearch`. 컴포넌트가 드는 건 **세우는 방식 다섯 줄**
(`flex` 세로 스택 · 가운데 정렬 · `textAlign` · `gap`)뿐이다.

- **조판을 props 로 받지 않는다.** 5벌의 제목 조판이 이미 셋으로 갈려 있어(`xl/strong/700` ·
  `base/500/text` · `15px/text`) `title`/`description` 으로 접으면 정본을 골라야 하고 다섯 중
  넷이 시각적으로 바뀐다. 조판은 `children` 이 든다 — 덕분에 액션 슬롯도 필요 없다
  (`NearBy` 는 CTA 자리에 링크가 아니라 *반경 넓히기 버튼 N개*가 들어간다)
- **바깥 여백을 소유하지 않는다.** 실측 셋(80·64·24px)이 전부 space 스케일에 떨어져 호출부
  sprinkles 한 줄로 내려간다 — `PageBanner`·`Callout`·`UnderlineTabs` 와 같은 규율
- **`gap` 만 컴포넌트 몫.** 실측이 16px : 8px 로 갈려 다수를 정본으로 골랐다. CTA 가 서는
  클러스터라 여백이 좁으면 버튼이 문구에 붙는다
- `asChild` — 지면이 이미 `Container` 로 셸을 세운 자리에서 래퍼가 겹치지 않게 한다

⚠️ 이름이 `ContentPlaceholder` 가 아닌 이유: seed 의 같은 이름은 *이미지가 안 뜬 자리*의 아이콘
박스고, 그 축은 `CoverBlock` 이 이미 든다.

sprinkles `textAlign` 축은 `EmptyState` 의 가운데 정렬을 소비처가 뒤집을 자리로 열었다.
`ds-utilities` 라 `ds-components` 를 확실히 이긴다 — 로컬 `.css.ts` 로 덮으면 같은 레이어 안에서
소스 순서가 승자를 정하게 된다. 덤으로 web-next 7개 파일의
`style(inComponentsLayer({ textAlign: 'center' }))` 복붙이 사라진다.
