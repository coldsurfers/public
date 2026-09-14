---
'@coldsurfers/wbe-tokens': minor
---

`WHITE BLIND EYE` 레이블 지면의 디자인 토큰을 발행한다.

값과 이름 규칙만 갖는다 — 색 4 · 활자(패밀리 3 · 단 9 · 행간 · 트래킹 · 굵기) · 간격 15 ·
치수 3 · 선 3. CSS 를 만들지 않으므로 VE·Tailwind·RN 중 무엇으로 구현할지는 소비처가 정한다.

```ts
import { color, fontSize, themeVars, tokenVarName } from '@coldsurfers/wbe-tokens'

color.bg                              // '#0a0a0a'
fontSize.display                      // 136
tokenVarName('fontSize', 'display')   // 'wbe-font-size-display'
themeVars                             // { '--wbe-bg': '#0a0a0a', … }
```

**`design-system` 의 테마가 아닌 이유.** `design-system` 은 `color` 축을 COLDSURF 고정값으로
못박는다(`docs/p1-boundary.md` 결정 1). warm-paper(라이트 고정)와 WBE(다크 고정)는 같은 계약
안에 못 들어간다. 한 화면에 같이 실릴 수 있어 변수는 `--wbe-` 로 네임스페이스를 가른다.

**간격은 두 축이다.** `gap*`(형제 사이)과 `pad*`(자리의 안쪽 여백)을 갈라 둔다 — 유틸이 한
스케일로 받으면 `gap: 'padHeroTop'`(104px 간격) 같은, 시안에 없는 조합이 타입상 유효해진다.
`spacing` 은 둘을 합친 것이고 CSS 변수는 `--wbe-spacing-*` 한 묶음으로 나간다.

발행 표면은 `dist` 하나다. 소스를 내보내면 소비처가 이 패키지의 TS 까지 컴파일해야 한다.
