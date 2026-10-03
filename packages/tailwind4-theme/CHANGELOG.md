# @coldsurfers/tailwind4-theme

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

### Patch Changes

- Updated dependencies [[`02c5cfd`](https://github.com/coldsurfers/public/commit/02c5cfd6c12a0b6310ad400921141ad5047e6df2), [`b423f11`](https://github.com/coldsurfers/public/commit/b423f11b27deba0527b7146dfad79a9d12228050), [`b79e13e`](https://github.com/coldsurfers/public/commit/b79e13e913cb646fa91ff240bff536704b2cfc66), [`313239d`](https://github.com/coldsurfers/public/commit/313239dd79183c911a47fa273bfbc211d2585465)]:
  - @coldsurfers/surf-ui@0.33.0

## 0.1.0

### Minor Changes

- [#53](https://github.com/coldsurfers/public/pull/53) [`08298c8`](https://github.com/coldsurfers/public/commit/08298c86acc8e7e67536f583e198bf28de525811) Thanks [@yungblud](https://github.com/yungblud)! - 신규 패키지 — COLDSURF 토큰을 Tailwind v4 `@theme` 로 잇는 한 장짜리 브릿지.

  `bg-bg` · `text-heading` · `bg-cover-forest` · `p-4` 가 우리 토큰 값을 쓰게 만든다. JS 는 없고
  `exports` 가 가리키는 건 CSS 파일 하나다. peer 는 `tailwindcss@4` 와 `@coldsurfers/design-system`.

  DS 안에 넣지 않은 이유: `@theme` 매핑은 Tailwind 소비자에게만 의미가 있는데 DS 의 `exports` 에
  한번 오르면 빼는 게 major 다. 가르면 안 쓰는 쪽은 설치를 안 해 0 바이트다
  (`docs/p1-boundary.md` 결정 4 개정).

### Patch Changes

- Updated dependencies [[`b4ee4db`](https://github.com/coldsurfers/public/commit/b4ee4db6d356406e66774388d083be92c130acfd)]:
  - @coldsurfers/design-system@0.12.0
