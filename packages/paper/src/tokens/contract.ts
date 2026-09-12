/**
 * 인쇄 시맨틱 계약 — **테마가 채워야 하는 변수의 목록**.
 *
 * 이 표가 세 곳을 묶는다. 테마 CSS 가 채우고, `src/css/` 가 `var()` 로 읽고, 빌드가 빠진 걸
 * 잡는다. 목록이 한 벌이라서 이름이 어긋날 자리가 없다 — 어긋나면 색이 안 나오는 게 아니라
 * 빌드가 깨진다.
 *
 * **접두가 `--paper-` 가 아니라 `--print-` 인 이유:** DS 가 이미 `--paper-warm` 을 자기
 * 네임스페이스로 쓰고 있다(`cssVarPrefix.paper`). 패키지 이름이 paper 라고 같은 접두를 쓰면
 * 한 이름이 두 값을 가리키게 된다 — DS 의 이름 사전이 금지하는 것이다.
 *
 * **값은 여기 없다.** 목록과 역할만 있고, 값은 테마가 준다. `coldsurf` 테마는 `build.mjs` 가
 * `@coldsurfers/design-system/tokens` 에서 파생하고, 소비처 테마는 자기 CSS 로 채운다.
 */

export type PrintVarGroup = 'surface' | 'line' | 'ink' | 'accent' | 'form' | 'type'

export type PrintVar = {
  readonly name: string
  readonly group: PrintVarGroup
  /** 이 변수가 지면에서 맡는 자리. 테마 작성자가 읽는 설명이다. */
  readonly role: string
}

export const PRINT_CONTRACT: readonly PrintVar[] = [
  // ── 면 ──────────────────────────────────────────────────────────────
  // 지면은 보통 흰색으로 둔다. @page margin 영역엔 배경을 칠할 수 없어서, 지면에 색을 깔면
  // 여백만 흰색으로 남아 페이지마다 액자 테두리가 생긴다. 톤은 아래 surface 가 맡는다.
  { name: '--print-canvas', group: 'surface', role: '지면 바탕' },
  { name: '--print-surface', group: 'surface', role: '지면에서 한 단 올라온 면 — 표 · 코드블록' },
  { name: '--print-surface-2', group: 'surface', role: '한 단 더 — 표 헤더 · 태그 pill' },
  { name: '--print-tint', group: 'surface', role: '강조 인용면' },

  // ── 선 ──────────────────────────────────────────────────────────────
  { name: '--print-border', group: 'line', role: '표 · 카드 테두리' },
  { name: '--print-border-soft', group: 'line', role: '표 내부 행 구분' },

  // ── 잉크 ────────────────────────────────────────────────────────────
  // 네 단계의 하한은 muted 다. subtle 로 읽는 글자를 찍지 않는다 — 근거는 DS tokens.ts.
  { name: '--print-ink', group: 'ink', role: '본문 기본' },
  { name: '--print-ink-strong', group: 'ink', role: '제목 · 볼드' },
  { name: '--print-ink-body', group: 'ink', role: '긴 문단' },
  { name: '--print-ink-muted', group: 'ink', role: '보조 · 캡션 — 읽는 글자의 하한' },
  { name: '--print-ink-subtle', group: 'ink', role: '불릿 기호 · 비활성 — 읽히지 않아도 되는 것' },

  // ── 강조 ────────────────────────────────────────────────────────────
  { name: '--print-accent', group: 'accent', role: '인용 바 · 지표 숫자' },
  { name: '--print-link', group: 'accent', role: '링크' },
  { name: '--print-quote', group: 'accent', role: '인용 본문' },
  { name: '--print-code-bg', group: 'accent', role: '코드 바탕' },
  { name: '--print-code-fg', group: 'accent', role: '코드 글자' },

  // ── 표지 색면 ───────────────────────────────────────────────────────
  // 어두운 면 위에서는 대비가 반대로 성립한다 — 본문 잉크 규칙(subtle 로 읽는 글자를 찍지
  // 않는다)이 여기서만 예외다. DS tokens.ts 가 cover scale 에 같은 단서를 달아두고 있다.
  { name: '--print-cover', group: 'surface', role: '표지 · 미션면의 색면' },
  { name: '--print-cover-ink', group: 'ink', role: '색면 위 글자' },
  { name: '--print-cover-ink-muted', group: 'ink', role: '색면 위 보조 글자' },

  // ── 형태 ────────────────────────────────────────────────────────────
  { name: '--print-radius', group: 'form', role: '표 · 카드 · 코드블록 모서리' },

  // ── 타이포 ──────────────────────────────────────────────────────────
  { name: '--print-font-sans', group: 'type', role: '본문' },
  { name: '--print-font-mono', group: 'type', role: '코드 · 수치' },
  { name: '--print-track', group: 'type', role: '본문 자간' },
  { name: '--print-track-tight', group: 'type', role: '큰 제목 자간 — 크게 쓸수록 더 조인다' },
  { name: '--print-weight-strong', group: 'type', role: '제목 · 본문 볼드' },
  { name: '--print-weight-sub', group: 'type', role: '한 단 아래 위계 — 소제목' },
]

export const PRINT_VAR_NAMES: readonly string[] = PRINT_CONTRACT.map((entry) => entry.name)
