# @coldsurfers/design-system

COLDSURF 디자인 시스템 — 토큰 값 · CSS 계약 · React primitives 를 담은 **단일 정본 패키지**.

> 🚧 **토큰과 CSS 계약까지 들어왔다**([#220](https://github.com/coldsurfers/paul-rockstar/issues/220) P2).
> `./primitives` 는 아직 비어 있다 — P3.

## 왜 하나인가

원래는 셋이었다 — `tokens`(값) · `design-system`(계약과 순서) · `ui`(컴포넌트).
값 / 이름 승격 / 값 발행이 두 패키지에 걸쳐 있어서, **같은 규칙이 두 곳에 살았다.**
어긋나도 타입은 통과하고 런타임에 `var(--없는이름)` 이 되어 색만 안 나온다.

합치면 그 경계가 사라진다. 병합 근거는 취향이 아니라 실재하는 결함이다.

## 진입점

| 서브패스 | 무엇 | React 필요 |
| --- | --- | --- |
| `.` | `vars`(CSS 변수 계약) · `media` · `@layer` 이름 | ✗ |
| `./tokens` | 토큰 값(순수 데이터) · 이름 규칙 · `coverToneFor` | ✗ |
| `./sprinkles` | 원자 유틸. JS 38 kB 라 배럴에서 갈랐다 | ✗ |
| `./primitives` | Button · Chip · Badge · … | ✓ |
| `./styles.css` | 컴파일된 CSS. **소비 앱이 한 번 import 한다** | ✗ |

## 설치

```bash
pnpm add @coldsurfers/design-system
```

`react` · `react-dom` 은 peer 다(`^19`). `./primitives` 를 안 쓰면 필요 없다.

## 규율

- **`@layer` 순서가 계약이다.** `ds-reset` → `ds-tokens` → `ds-components` → `ds-utilities`.
  컴포넌트 스타일은 `ds-components` 에, 유틸은 뒤에 — 그래야 호출자가 넘긴 className 이 항상 이긴다.
- **흡수에는 상한이 있다.** primitive 하나가 어느 축까지 먹고 어디부터 새 primitive 인가는
  공개 패키지에선 곧 API 계약이다. variant 를 늘리기 전에 축을 먼저 따진다.

## 라이선스

MIT
