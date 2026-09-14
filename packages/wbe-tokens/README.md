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
| 담는다 | 색 4 · 활자(패밀리 3 · 단 9 · 행간 · 트래킹 · 굵기) · 간격 15 · 치수 3 · 선 |
| 안 담는다 | CSS 변수 발행 · VE 테마 · React 컴포넌트 · 폰트 파일 |

컴포넌트를 올리지 않는 이유는 `AGENTS.md` 의 흡수 기준이다 — 소비처가 아직 하나도 없다.
두 번째 소비처가 생기면 그때 `wbe-design-system` 을 판다.

## 상태

**비발행(`private: true`) workspace 패키지다.** `exports` 가 `src` 를 직접 가리키므로
소비처가 TS 를 같이 컴파일한다. 발행으로 전환할 땐 셋이 같이 온다 — `vite build` + `dist`
진입점 · `files: ["dist"]` · `check:exports`. 계약이 굳기 전에는 열지 않는다.

## 출처

Figma `Playground - Dev CM` Page 16 — `WBE / STATE A~D`(랜딩 장부 4단계) ·
`WBE / ARTIST — shevil`(아티스트 상세). 값을 고칠 땐 시안이 먼저다.
