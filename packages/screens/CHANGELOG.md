# @coldsurfers/screens

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

- [#152](https://github.com/coldsurfers/public/pull/152) [`36484de`](https://github.com/coldsurfers/public/commit/36484de097e79b904e42f0611b45da7316523936) Thanks [@yungblud](https://github.com/yungblud)! - `@coldsurfers/screens` 신설 — RN 화면의 조립층. DS 위에 얹는다.

  첫 멤버는 `AppScreen` 하나. 배경 · safe-area 여백 · 탭바 여백 · Suspense 경계를 든다.
  헤더(react-navigation)와 에러 경계(react-query)는 안 든다.

  여백은 `offsetTop`(`'none'`·`'safeArea'`) / `offsetBottom`(`'none'`·`'safeArea'`·`'tabBar'`)
  두 축이다. 탭바 높이는 DS `useTabBarHeight()` 를 읽어 인셋을 상수로 박지 않는다.
  `ViewProps` 를 extends 해서 `style`·`testID`·접근성 축은 루트로 통과한다.
