---
"@coldsurfers/surf-ui": minor
"@coldsurfers/paper": minor
"@coldsurfers/markdown-renderer": minor
"@coldsurfers/screens": minor
"@coldsurfers/tailwind4-theme": minor
"@coldsurfers/design-system-mcp": minor
---

`@coldsurfers/design-system` 을 `@coldsurfers/surf-ui` 로 바꾸고, 색을 surf dark · light 두 스킴으로 교체한다. 시안 정본은 Figma `surf-ui · Foundations`(812:35) · `surf-ui · Components`(812:36).

**breaking**

- 패키지 이름: `@coldsurfers/design-system` → `@coldsurfers/surf-ui`. 서브패스(`/tokens` · `/primitives` · `/native/*` …)는 그대로다. 옛 이름은 더 발행하지 않는다.
- 색 값: warm-paper light → surf 무채색 light · dark. 계약 이름(`vars.color.*` · `--bg` 등)은 그대로고 값만 바뀐다.
- 스킴: `:root` 는 시스템 설정(`prefers-color-scheme`)을 따른다. `<html data-theme="dark|light">` 가 강제한다. RN `useScheme()` 도 기기 설정을 따른다.
- `Button`: `primary` 가 파랑 필이 된다(주 행동 하나). `accent` 는 `primary` 와 같은 값, `outline` 은 투명 + 테두리, 모든 크기의 모서리가 알약이다.
- `Chip`: `active` 가 글자색 필 + 바탕색 글자(반전)가 된다. 파랑은 주 행동에만 쓴다.

**추가**

- 색 키 `onAccent` · `accentSoft` · `tint` · `tintGlow` · `tintWash`. `tint*` 는 포스터에서 뽑아 앱이 화면 단위로 덮는다.
- `darkThemeVars` · `palette.neutral*`.
- primitives `Pill` · `Row`(`RowTime` · `RowDate`) · `ListCard` · `PosterCard` · `PosterStage`, `Eyebrow tone="tint"`.

다른 패키지는 peer 이름이 `@coldsurfers/surf-ui` 로 바뀐다.
