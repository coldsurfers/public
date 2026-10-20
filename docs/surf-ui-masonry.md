# surf-ui Masonry · native PinCard — 웹 · RN 한 벌

정본 시안: `v3/PinCard`(Figma `1455:263`). 출발점: billets-app `features/pin/ui/pin-masonry` · `pin-card`.

## 목표

핀 다단 그리드를 웹 · RN 이 같은 계약으로 쓴다. 지금은 웹 `PinCard` 만 surf-ui 에 있고, 그리드는 소비처마다 따로다.

## 부품

| 부품 | 진입점 | 모양 |
| --- | --- | --- |
| `MASONRY_SPEC` · `PIN_CARD_SPEC` | `contract` | 열 간격 12 · 줄 간격 16 · 받기 전 비율 3:4 · 카드 치수 · 페이드 · 눌림 값 |
| `Masonry<T>` | `cards` (웹) | flex 열 N 개. 가장 낮은 열에 차례로 놓고, 놓인 항목은 다음 쪽이 붙어도 안 옮긴다 |
| `Masonry<T>` | `native/Masonry` | FlashList v2 `masonry` 래퍼 — 가상화 · 실측 높이로 열 균형. 스크롤을 소유한다. 배럴엔 없다(서브패스 전용) |
| `PinCard` | `native/PinCard` | 웹 `PinCard` 포팅. 포스터 원래 비율 · 페이드인 · 눌림 축소 |

## 결정

| # | 결정 |
| --- | --- |
| 1 | `Masonry<T>` 는 도메인을 모른다 — `items` · `keyOf` · `renderItem` · 웹만 `heightOf`(높이 추정 · 핀이면 `pinCardHeight`). `Pin` 타입 · 담기 단추는 앱에 남는다 |
| 2 | native 는 FlashList v2(`@shopify/flash-list`, JS 전용 · New Arch) — optional peer 로 연다. 열 배치는 FlashList `optimizeItemArrangement` 가 실측 높이로 한다 |
| 3 | native `Masonry` 가 스크롤을 소유한다 — `header` · `footer` · `onEndReached` · `refreshControl` 을 그대로 넘긴다. 다른 스크롤 안에 박는 모드는 열지 않는다 |
| 4 | 웹 배치는 CSS `column-count` 가 아니라 JS 열 — 다음 쪽이 붙을 때 이미 놓인 카드가 다른 열로 옮겨 다니지 않게 |
| 5 | 포스터 비율 캐시(`posterRatios`)는 native `PinCard` 안 모듈 Map — 카드가 재활용 · 재마운트돼도 3:4 에서 덜컥 늘어나지 않는다 |
| 6 | 손맛 — native: 포스터 페이드인 180ms · 누르면 0.97 스프링(RN 코어 `Animated` — `Skeleton` 과 같은 판단). 웹: `:active` 0.97 축소만. 웹 페이드인은 `onLoad` 상태가 필요해 카드가 `'use client'` 가 되므로 이번엔 안 연다 |
| 7 | 리렌더 — native `PinCard` 는 `memo`, `action` 은 소비처가 `renderItem` 안에서 만든다. `Masonry` 는 `renderItem` 을 FlashList 에 그대로 넘겨 화면 밖 카드는 안 그린다 |
| 8 | 캡션 높이 추정(`pinCardHeight`)은 `meta` 유무를 본다 — 출처 없는 카드에서 열 끝이 어긋나던 것 |

## 위험

- docs(react-native-web)에선 FlashList 가 열 폭을 못 재 그리드 미리보기가 없다 — native `Masonry` 는 실기기에서 처음 본다.
- FlashList 는 포스터가 늦게 와 높이가 바뀌면 **그 뒤 카드의 열을 다시 계산한다** — 화면 안에서 카드가 옮겨 보이면 #5 캐시로 줄이고, 그래도 보이면 `optimizeItemArrangement` 를 끈다(순서 고정 · 균형 포기). 실기기에서 판정.

## 순서 — public

- [x] S1 스펙
- [x] S2 `contract/masonry.ts` · `contract/pin-card.ts` + 웹 `PinCard.css.ts` 가 표를 읽게
- [x] S3 웹 `Masonry` (+ `:active` 축소)
- [x] S4 native `PinCard`
- [x] S5 native `Masonry` (FlashList peer · external · 진입점 셋)
- [x] S6 docs 예제 · 페이지(patterns · native) · changeset
- [x] S7 검증 다섯 · docs 화면 확인
- [x] S8 커밋 · PR

## 다음 — billets-app (발행 후 별도 PR)

`features/pin/ui/pin-masonry` · `pin-card` 를 surf-ui 로 갈아끼운다. 피드형(피드 · 토픽 · 보드 · 검색 · 취향 랜딩)은 `ScrollView` → `Masonry` 의 `header`/`onEndReached` 로. 다른 콘텐츠 밑에 박힌 자리(핀 상세 관련 핀 · 공연장 상세)는 위 콘텐츠를 `header` 로 올린다.
