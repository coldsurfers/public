---
"@coldsurfers/surf-ui": minor
"@coldsurfers/paper": minor
"@coldsurfers/markdown-renderer": minor
"@coldsurfers/screens": minor
"@coldsurfers/tailwind4-theme": minor
"@coldsurfers/design-system-mcp": minor
---

`@coldsurfers/design-system` 을 `@coldsurfers/surf-ui` 로 바꾸고, 색 · layout · shape 토큰을 Figma `surf-ui` 변수 컬렉션(`3sIMxSgWyp7RYonfhAAZIc`)으로 통째로 교체한다. 스펙: `docs/surf-ui-migration.md`.

**breaking**

- 패키지 이름: `@coldsurfers/design-system` → `@coldsurfers/surf-ui`. 서브패스는 그대로다.
- 색 계약 이름이 Figma 이름을 따른다: `vars.color.text` → `vars.color.textPrimary`, `--text` → `--surf-text-primary`. 옛 키 30여 개와 `ColorScheme` 의 옛 모양이 사라진다(대응표는 스펙).
- 지운 것: `--cs-*` 원색층(`palette`) · `ink` · `paper` · `gradient` 스케일, `lightThemeVars`.
- 면은 두 벌이다: `:root` 는 light, `data-surface="ink"` 를 단 요소 안은 ink. OS 다크모드와 무관하다.
- `Button` 의 `color` 계열 키 · sprinkles `color` · `background` 값도 새 이름을 받는다.

**추가**

- `colorSchemes`(`ink` · `light`) · `inkSurfaceVars` · `lightSurfaceVars` · `Surface` 타입.
- `layout`(mobile · desktop ≥1024 — `--surf-layout-*`) · `shape`(`--surf-radius-*` · `--surf-size-*` · `--surf-type-*`).
- `TEXT_TONE_COLOR` — `Text` 의 `tone` 축 → 색 역할.

다른 패키지는 peer 이름이 `@coldsurfers/surf-ui` 로 바뀌고 새 색 이름을 읽는다. `paper` 의 인쇄 테마 값이 새 역할에서 다시 파생되어 일부 회색이 조금 바뀐다.
