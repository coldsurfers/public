# surf-ui 부품 — 홈 시안 `821:2` 의 다섯 조각

토큰(#237) 위에 올리는 첫 부품. 치수 정본은 Figma `821:2`(홈 · desktop)이고, 색은 전부 `vars.color` 역할이라
`data-surface="ink"` 안에 넣으면 그대로 잉크 면이 된다.

## 부품

| 부품 | 진입점 | Figma | 모양 |
| --- | --- | --- | --- |
| `RowAction` | `primitives` | `821:65` | 높이 32 · r8 · 굵게 14 · `action/tint-fill` 면 + `action/tint-text` 글자 |
| `PickCard` · `PickRow` | `cards` | `821:92` | 패널 r20 · 머리(굵게 16 + Geist 키커 + 오른쪽 슬롯) · 줄 r12 낱장 · 꼬리 한 줄 |
| `PosterTile` | `cards` | `821:213` | 포스터 r24 · 제목 Black 22(−4%) + 메타 · 오른쪽 행동 |
| `ChipCard` · `ChipCardItem` | `cards` | `821:317` | 패널 r20 · 머리 굵게 16 · 칩 r8 `row/fill` · 라벨 굵게 13 + Geist 개수 |
| `FeatureCard` | `cards` | `821:376` | 패널 r20 · 패딩 24 · 제목 Black 24(−4%) · 한 줄 · 아래 행동 |

## 결정

| # | 결정 |
| --- | --- |
| 1 | 행동 · 머리 오른쪽 · 메타는 **슬롯**(`ReactNode`)으로 받는다 — 스웰 미터 · 스웰 태그는 앱 도메인이라 DS 에 안 넣는다 |
| 2 | 링크는 `asChild` 로 — `Chip` 과 같은 규율. 라우터를 물지 않는다 |
| 3 | 글꼴은 `sans`(Pretendard). Figma 의 Noto Sans KR 은 Pretendard 대역이다. 숫자 · 키커는 `geist` |
| 4 | `fontWeight` 에 `bold`(700) · `black`(900) 추가 — 열린 축이라 추가는 minor |
| 5 | 여러 칸 배치(3단 · 2:1)는 부품이 아니라 소비처 그리드가 진다 |
| 6 | 웹만. native 짝은 쓰는 화면이 생길 때 |

## 순서 (스텝마다 biome · check:type · build)

- [x] S1 스펙 — 이 문서
- [x] S2 `RowAction` + `fontWeight` 추가
- [x] S3 `PickCard` · `PosterTile` · `ChipCard` · `FeatureCard`
- [x] S4 문서 페이지 · examples · changeset
- [x] S5 검증 다섯 · `styles.css` 크기 · docs 화면 확인
- [x] S6 커밋 · PR

## 범위

- ✅ 위 다섯 부품(웹) · 문서
- ⏸ native 짝 · 날짜 블록 줄 · 행동 타일 · 정보 줄 · 시트
- ❌ 스웰 미터 · 스웰 태그(앱 몫)
