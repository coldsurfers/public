# @coldsurfers/design-system-mcp

## 0.2.0

### Minor Changes

- [#237](https://github.com/coldsurfers/public/pull/237) [`313239d`](https://github.com/coldsurfers/public/commit/313239dd79183c911a47fa273bfbc211d2585465) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/design-system` 을 `@coldsurfers/surf-ui` 로 바꾸고, 색 · layout · shape 토큰을 Figma `surf-ui` 변수 컬렉션(`3sIMxSgWyp7RYonfhAAZIc`)으로 통째로 교체한다. 스펙: `docs/surf-ui-migration.md`.

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

## 0.1.1

### Patch Changes

- [#120](https://github.com/coldsurfers/public/pull/120) [`b55631d`](https://github.com/coldsurfers/public/commit/b55631d247ec3bc9b0a12a67379564d819b65429) Thanks [@yungblud](https://github.com/yungblud)! - `list_docs` 의 `category` 설명에서 카테고리를 나열하지 않는다.

  `"foundations", "components", "patterns"` 를 예시로 적어 뒀는데 `native` 섹션이 생기면서 목록이
  낡았다. 섹션이 늘 때마다 이 줄이 조용히 거짓말을 시작하므로, 정본인 `discover_docs` 를 가리키게 바꾼다.

## 0.1.0

### Minor Changes

- [#60](https://github.com/coldsurfers/public/pull/60) [`534aaea`](https://github.com/coldsurfers/public/commit/534aaea4663f05578ed9df485a950976ce6728ec) Thanks [@yungblud](https://github.com/yungblud)! - 문서 MCP 서버를 낸다 — `discover_docs` · `list_docs` · `get_doc` 셋으로 에이전트가 design.coldsurf.io 를 직접 읽는다. `@coldsurfers/docs-mcp` 를 대신한다.
