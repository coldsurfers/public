# @coldsurfers/wbe-tokens

`WHITE BLIND EYE` 레이블 지면의 디자인 토큰. **값과 이름 규칙만** 갖고 CSS 는 만들지 않는다.

```ts
import { color, fontSize, themeVars, tokenVarName } from '@coldsurfers/wbe-tokens'

color.bg               // '#0a0a0a'
fontSize.display       // 136
tokenVarName('fontSize', 'display')  // 'wbe-font-size-display'
themeVars              // { '--wbe-bg': '#0a0a0a', … } — 루트나 서브트리에 주입
```

## 왜 design-system 의 테마가 아닌가

`@coldsurfers/design-system` 은 `color` 축을 COLDSURF 고정값으로 못박는다
(`docs/p1-boundary.md` 결정 1 — 소비자가 덮을 수 없다). warm-paper(라이트 고정)와
WBE(다크 고정)는 같은 계약 안에 못 들어간다. 그래서 별도 패키지다.

한 화면에 같이 실릴 수 있어 변수는 `--wbe-` 로 네임스페이스를 가른다.

## 범위

| | |
| --- | --- |
| 담는다 | 색 4 · 활자(패밀리 3 · 단 9 · 행간 · 트래킹 · 굵기) · 간격 15 · 치수 3 · 선 3 |
| 안 담는다 | CSS 변수 발행 · VE 테마 · React 컴포넌트 · 폰트 파일 |

컴포넌트를 올리지 않는 이유는 `AGENTS.md` 의 흡수 기준이다 — 소비처가 아직 하나도 없다.
두 번째 소비처가 생기면 그때 `wbe-design-system` 을 판다.

## 간격이 두 축인 이유

`gap*` 은 **형제 사이**, `pad*` 는 **자리의 안쪽 여백**이다. 유틸이 둘을 한 스케일로 받으면
`gap: 'padHeroTop'`(104px 간격) 같은, 시안에 없는 조합이 타입상 유효해진다. `spacing` 은 둘을
합친 것이고 CSS 변수는 `--wbe-spacing-*` 한 묶음으로 나간다.

`pad*` 가 `xs/sm/md` 가 아니라 *자리* 이름(hero·section·cell…)인 것도 같은 이유다 — 스케일로
뭉개면 히어로 104/96 과 섹션 56/72 의 수직 리듬이 살아남지 못한다.

## 발행

GitHub Packages(`@coldsurfers` 스코프)로 나간다. 발행 표면은 `dist` 하나다 — 소스를 내보내면
소비처가 이 패키지의 TS 까지 컴파일해야 하고, 그건 계약이 아니라 부탁이다.

```
npm config set @coldsurfers:registry https://npm.pkg.github.com
```

## 출처

Figma `Playground - Dev CM` Page 16 — `WBE / STATE A~D`(랜딩 장부 4단계) ·
`WBE / ARTIST — shevil`(아티스트 상세). 값을 고칠 땐 시안이 먼저다.
