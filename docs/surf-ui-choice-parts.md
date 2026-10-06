# surf-ui 초이스 부품 — 공통 부품 `1028:156` 의 아홉 조각

정본: Figma `1028:156`(초이스 공통 부품) ← 최종 시안 `1019:2`. 색은 전부 `vars.color` 역할이라 `Page mode="ink"` 안에 넣으면 잉크 면이 된다(초이스 MVP 는 ink 고정).

시안 부품 20개 중 **도메인 없이 설 수 있는 9개만** 온다. 판 번호 · 다음 판 · 앱 설치처럼 초이스를 아는 부품은 web-next `features/choice` 에 남는다.

## 부품

| 부품 | 진입점 | Figma | 모양 | 두 번째 소비처 |
| --- | --- | --- | --- | --- |
| `Sheet` | `primitives` | `1028:381` | `Modal placement="bottom"` + 패널 r28 · 손잡이 36×4 · safe-area. ≥1024 는 가운데 모달 최대 560 | web-next 시트 7개가 손잡이 · radius 를 각자 그린다(SellerSheet · ChangeAreaSheet · DateSheet …) |
| `StatPill` | `primitives` | `1028:210` | 아이콘 + Geist 숫자 · 높이 19 · `row/fill` 면 · `tone="hot"` 은 주황 틴트 | 판 머리 · 공연 줄 · 공연 상세 제목 |
| `ReactionBar` | `primitives` | `1028:400` | 같은 폭 버튼 N개 · 라벨 + Geist 개수 · 켠 것은 `selected/fill` · 하나만 켠다 | 고르기 시트 · 공연 상세 |
| `KeyValueRow` | `primitives` | `1028:387` | 왼쪽 라벨 `text/secondary` · 오른쪽 값 굵게 · 높이 36 · 줄 사이 선 | 좌석 등급 · 공연 상세 좌석 |
| `MediaRow` | `cards` | `1028:331` | 썸네일 52×70 r8 · 시각 키커 · 제목 굵게 · 메타 · 아래 `footer` · 오른쪽 `aside`. `selected` = sky 선 · `dimmed` = 흐림 | 판의 공연 줄 · 고르기 시트 머리 |
| `InfoRow` | `cards` | `1028:461` | 썸네일/아이콘 44 · 이름 굵게 · 부제 · `›` · 줄 전체가 링크 | 공연장 줄(web-next `VenueRow`) · 판 쪽 공연장 |
| `LinkBand` | `cards` | `1028:431` · `1028:468` | 선 있는 띠 r12 · 왼쪽 `lead`(키커 또는 큰 Geist 숫자) + 한 줄 · 오른쪽 `›` | 「CHOICE #031 에 실림」 · 목록의 판 예고 |
| `PosterThumb` | `cards` | `1028:217` | 포스터 r12 3:4 · 왼쪽 아래 `badge` 슬롯 · 없으면 `CoverBlock` | 포스터 벽 · 같은 판 선반 |
| `PosterShelf` | `cards` | `1028:452` | 머리 키커 + `PosterThumb` 가로 줄(모바일 가로 스크롤) · 아래 제목 굵게 + 메타 | 공연 상세 「같은 판」 · 판 사이 홈 |

## 결정

| # | 결정 |
| --- | --- |
| 1 | 세 층으로 나눈다 — surf-ui 는 위 9개, 초이스 전용 11개는 web-next(2026-10-06 사용자 결정) |
| 2 | 슬롯은 평평한 props + `ReactNode`(`aside` · `footer` · `badge` · `lead`). compound(`MediaRow.Thumb`) 는 안 쓴다 — 기존 `PickRow` · `PosterTile` 과 같은 결 |
| 3 | 링크는 `asChild` — 라우터를 물지 않는다(`Chip` · `RowAction` 과 같은 규율) |
| 4 | 상태는 boolean props(`selected` · `dimmed` · `active`) → 안에서 `data-*`. 소비처가 className 으로 상태를 흉내 내지 않게 |
| 5 | 숫자 · 상태 타입은 도메인을 모른다 — `StatPill` 은 `icon` + `value`, `ReactionBar` 는 `items: { id, label, count }[]` + `value` + `onChange` |
| 6 | `Sheet` 는 `Modal` 을 감싼다 — 행동(`useDialogBehavior`) · portal · 표면 모드 재부착은 그대로 물려받고, 뒤 가림(`overlay` 60%)과 패널 모양만 더한다 |
| 7 | JSDoc 첫 줄에 Figma node 를 적는다 — 시안 ↔ 코드 왕복 |
| 8 | 웹만. native 짝은 앱 화면이 생길 때 |
| 9 | 모바일 아래 · 데스크탑 가운데 전환은 `Modal` 의 새 자리 `placement="sheet"` 한 규칙이 든다 — `Sheet` 가 오버레이에 `@media` 를 덧대면 같은 레이어에서 소스 순서로 갈린다 |
| 10 | `ReactionBar` 는 `fieldset` — 잠금은 자체 prop 없이 `disabled` 하나로 안의 버튼이 함께 꺼진다 |
| 11 | 줄 전체가 링크인 cards(`MediaRow` · `InfoRow` · `LinkBand` · `PosterShelfItem`)의 `asChild` 는 **자식의 글이 제목**이 되고 나머지가 그 둘레에 그려진다(`cards/as-child.tsx`) — `<InfoRow asChild meta=…><Link to=…>이름</Link></InfoRow>`. 빈 `<a />` 를 넘기면 스크린 리더와 `useAnchorContent` 린트가 막혀서 이 모양으로 갔다. `Chip` 의 `asChild` 는 클래스만 입힌다 |

## 쓰는 모양

```tsx
<Sheet open={open} onClose={close} label="고르기" head={<MediaRow thumb={…} kicker="일 10.11 · 14:00" title="인터스텔라 필름콘서트" meta="경희대 평화의전당" />}>
  <KeyValueRow label="VIP석" value="189,000원" />
  <ReactionBar items={reactions} value={mine} onChange={react} />
  <Button variant="accent" asChild><a href={url}>놀유니버스에서 예매 ↗</a></Button>
</Sheet>
```

## 순서 (스텝마다 biome · check:type · build)

- [x] S1 스펙 — 이 문서
- [x] S2 primitives — `Sheet` · `StatPill` · `KeyValueRow` · `ReactionBar`
- [x] S3 cards — `MediaRow` · `InfoRow` · `LinkBand` · `PosterThumb` · `PosterShelf`
- [x] S4 문서 페이지 · examples · changeset(minor)
- [x] S5 검증 다섯 · `styles.css` 크기 · docs 화면 확인 — 80.0 → 84.7KB. 화면에서 고친 셋: 줄 높이를 소비처에서 물려받음(문서 본문 28px) → 루트마다 `lineHeight` 고정 · 시트 뒤 가림 없음 → `overlay` 60% · 손잡이가 inline 이라 0×0 → block
- [x] S6 커밋 · PR

## 범위

- ✅ 위 9개(웹) · 문서
- ⏸ MY PICK 도장 — 쓰는 곳이 초이스 하나(Drop 폐기). 두 번째가 생기면 `Stamp` 로
- ⏸ web-next 기존 시트 7개를 `Sheet` 로 갈아끼우기 — 별도 작업
- ❌ 판 머리 · 다음 판 카드 · 카운트다운 · 지난 판 결과 · 고르기 시트 조립 · 앱 시트 · 상단 바 — web-next `features/choice` 와 앱 헤더의 몫
