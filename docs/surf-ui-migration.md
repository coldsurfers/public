# surf-ui 이관 — `@coldsurfers/design-system` → `@coldsurfers/surf-ui`

정본은 Figma `3sIMxSgWyp7RYonfhAAZIc` 의 **변수 컬렉션 셋** — `surf-ui / color` · `surf-ui / layout` · `surf-ui / shape`.
값을 바꿀 땐 Figma 를 먼저 고치고 여기를 따라 고친다. 화면 정본은 홈 `821:2` · `822:2`, 공연 상세 `764:827`.

#236 은 닫는다 — 지금은 지운 옛 Figma 컬렉션(무채색 `#0b0b0d` / `#f6f4ef`)을 정본으로 삼았다.

## 확정한 결정 (2026-10-03)

| # | 결정 |
| --- | --- |
| 1 | 브랜치 `feat/surf-ui-tokens` 를 main 에서 새로 판다. #236 의 이름 변경 커밋만 가져온다 |
| 2 | 색 토큰은 **통째로 교체**. `--cs-*` 원색층 · `ink` · `paper` · `gradient` · 옛 `ColorScheme` 키를 지운다 |
| 3 | 계약 이름 = Figma 변수 이름. `bg/base` → `vars.color.bgBase` → `--surf-bg-base` |
| 4 | ink / light 는 **면 단위**. 기본 light, `data-surface="ink"` 를 단 요소 안은 ink. OS 다크모드와 무관 |
| 5 | 이번 PR 은 **토큰만** — 이름 변경 + color · layout · shape + 기존 컴포넌트를 새 이름에 맞춤. 새 부품은 다음 PR |
| 6 | `cover` · `nodeTone` 은 남긴다 — 테마가 아니라 데이터로 고르는 색이다 |

## 색 — Figma 27 역할 (`surf-ui / color`)

| 역할 | ink | light | 옛 키 |
| --- | --- | --- | --- |
| `bg/base` · `bg/alt` | `#0a0f1a` · `#0b132e` | `#ffffff` · `#f5f7fa` | `bg` |
| `surface/raised` | `#131a2d` | `#ffffff` | `surface` |
| `panel/fill` · `panel/line` | `#131a2d` · 흰 8% | `#eef3ff` · 투명 | `surface2` · `codeBg` |
| `row/fill` | 흰 5% | `#ffffff` | — |
| `line/divider` | 흰 8% | `#d7dee7` | `border` · `borderSoft` |
| `state/hover` · `state/pressed` | 흰 6% · 10% | 잉크 6% · 8% | `surfaceHover` · `surfaceGhost*` · `surfaceActive` |
| `text/primary` | `#ffffff` | `#0a0f1a` | `text` · `strong` · `body` · `heading` · `link` |
| `text/secondary` | `#99a3b8` | `#5b6472` | `muted` · `blockquote` |
| `text/tertiary` | `#99a3b8` 60% | `#9ca3af` | `subtle` · `faint` |
| `text/on-media` | 흰 | 흰 | `paper.warm` · `palette.white` |
| `kicker` | `#9ec2ff` | `#2563ff` | `ink.accent` · `codeFg` |
| `action/tint-fill` · `action/tint-text` | 키커 14% · 키커 | 키커 14% · 키커 | — |
| `action/primary` · `action/primary-hover` | `#2563ff` · `#1d4fd8` | 같음 | `accent` · `linkHover` · `accentHover` |
| `action/on-primary` | 흰 | 흰 | — |
| `glow` · `overlay` | 파랑 28% · `#0a0f1a` | 같음 | `palette.deepNight` |
| `status/{success,warning,danger}` + `-bg` | 밝은 셋 + 14% | 진한 셋 + 14% | `status*` |

## layout · shape

| 컬렉션 | 변수 | CSS |
| --- | --- | --- |
| `surf-ui / layout` (mobile · desktop ≥1024) | gutter 20/64 · content-width 350/1312 · section-y 56/96 · repeat-gap 12/24 · hero/poster-height 300/660 · hero/decision-width 350/500 · hero/column-gap 20/56 · type/hero-title 36/56 · type/tile-title 18/22 | `--surf-layout-*` |
| `surf-ui / shape` | radius panel 20 · sheet 28 · poster 24 · row 12 · row-action 8 · pill · size row-action-height 32 · date-block 52×62 · thumb 52 · type kicker 11 · card-head 16 · row-title 15 · body 14 · meta 12 | `--surf-radius-*` · `--surf-size-*` · `--surf-type-*` |

옛 스케일(`spacing` · `radius` · `fontSize` …)은 그대로 둔다 — 열린 축이고 색이 아니다.

## 순서 (스텝마다 biome · check:type · build)

- [x] S0 브랜치 — main 에서 새로, 이름 변경 커밋 cherry-pick
- [x] S1 스펙 — 이 문서
- [x] S2 토큰 — `tokens.ts` · `contract.css.ts` · `theme.css.ts` · `native.ts`
- [x] S3 사용처 — surf-ui · markdown-renderer · native · docs
- [x] S4 검증 다섯 · `styles.css` 크기 · changeset(minor)
- [ ] S5 커밋 · PR (#236 닫기)

## 범위

- ✅ public 레포의 이름 · 색 · layout · shape 토큰, 기존 컴포넌트의 색 이름
- ⏸ 새 부품(고르기 카드 · 줄 행동 버튼 · 포스터 타일 · 칩 카드 · 기능 카드) — 다음 PR
- ⏸ paul-rockstar 소비처 전환 · 옛 패키지 deprecate
- ❌ `cover` · `nodeTone` 재설계
