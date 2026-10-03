# surf-ui 이관 — `@coldsurfers/design-system` → `@coldsurfers/surf-ui`

Figma `3sIMxSgWyp7RYonfhAAZIc` 의 `surf-ui · Foundations`(812:35) · `surf-ui · Components`(812:36) 가 시안 정본.

## 목표

1. 패키지 이름을 `@coldsurfers/surf-ui` 로 바꾼다(폴더 `packages/surf-ui`).
2. 색을 warm-paper light 하나에서 **surf dark · light 두 스킴**으로 통째로 바꾼다. 계약 이름(`vars.color.*`)은 그대로 — 값만 바뀐다.
3. surf 컴포넌트를 들인다.

## 확정한 결정 (2026-10-03)

| # | 결정 |
| --- | --- |
| 1 | 토큰은 **통째로 교체**. 기존 화면 색이 전부 바뀐다 |
| 2 | 이번 PR 에 이름 + 토큰 + 컴포넌트까지 |
| 3 | 브랜치 `feat/surf-ui` + PR. 머지 후 changeset 발행 |

## 색 — 계약 키 → surf 의미

| 계약 키 | surf | dark | light |
| --- | --- | --- | --- |
| `bg` | bg/base | `#0b0b0d` | `#f6f4ef` |
| `surface` | surface/raised | `#17171b` | `#ffffff` |
| `surface2` · `surfaceGhost` · `surfaceHover` | surface/sunken | 흰 6% | 검 5% |
| `border` · `borderSoft` | line/strong · line/subtle | 흰 16% · 8% | 검 16% · 8% |
| `text` · `strong` · `heading` · `link` | text/primary | `#ffffff` | `#111113` |
| `body` · `muted` | text/secondary | `#a1a1aa` | `#6b6b73` |
| `subtle` · `faint` | text/tertiary | `#a1a1aa` 60% | `#6b6b73` 60% |
| `accent` · `linkHover` | accent/blue | `#2563ff` | `#2563ff` |

새 키: `onAccent` · `accentSoft` · `tint` · `tintGlow` · `tintWash`(포스터에서 뽑는 색 — 런타임 주입, `cover` 와 같은 성격).

스킴 선택: `:root` = light · `@media (prefers-color-scheme: dark)` 는 `:root:not([data-theme="light"])` · `[data-theme="dark"]` 강제.
스킴 불변 축(`cover` · `paper` · `ink` · `palette` · `gradient` · `nodeTone`)은 이번에 손대지 않는다.

## 컴포넌트

| 컴포넌트 | 처리 |
| --- | --- |
| Button | API 유지(5 variant), 값만 surf. primary = 파랑 |
| Chip · Eyebrow · Modal | API 유지, 값만 surf. Modal = Sheet(모바일 아래 · 데스크탑 가운데) |
| Pill · Row · ListCard · PosterCard · PosterStage | **새로** — `primitives` 배럴 + docs 페이지 |

## 순서 (스텝마다 biome · check:type · build · check:exports)

- [ ] S1 이름 변경 — 폴더 · package.json · 내부 소비 6곳 · docs · 문서 링크
- [ ] S2 토큰 — `ColorScheme` dark · light, theme.css 스킴 발행, native 반영
- [ ] S3 기존 컴포넌트 값 점검 (Button · Chip · Eyebrow · Modal)
- [ ] S4 새 컴포넌트 5 + docs 페이지 · examples
- [ ] S5 changeset(major) · PR

## 범위

- ✅ public 레포 안의 이름 · 토큰 · 컴포넌트
- ⏸ paul-rockstar 소비처 전환(발행 후 별도 PR) · 옛 패키지 deprecate(사용자 실행)
- ❌ `cover` 등 스킴 불변 축 재설계 · RN 컴포넌트 신규
