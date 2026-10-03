/**
 * 토큰 **값**의 SSOT. 이 TS 객체가 정본이고, CSS 변수는 여기서 파생된다.
 *
 * **색 · layout · shape 의 값은 Figma 변수 컬렉션이 정본이다** — `3sIMxSgWyp7RYonfhAAZIc` 의
 * `surf-ui / color` · `surf-ui / layout` · `surf-ui / shape`. 값을 바꿀 땐 Figma 를 먼저 고치고
 * 여기를 따라 고친다. 이름도 Figma 를 따른다: `bg/base` → `bgBase` → `--surf-bg-base`.
 *
 * 파생 경로는 둘이다:
 *   - 이 패키지의 `../css/theme.css.ts` — VE 가 `styles.css` 로 굽는다(소비자가 쓰는 길)
 *   - 소비 레포의 codegen — 이 파일이 export 하는 `tokenVarName` 을 읽어 자기 앱용 CSS 를 만든다
 *     (근거는 docs/p1-boundary.md 결정 4)
 *
 * spacing·radius·fontSize·lineHeight·letterSpacing·fontWeight·fontFamily·breakpoints 는 소비자가
 * 덮을 수 있는 열린 축이고, color·layout·shape·cover 는 COLDSURF 고정값이다(docs/p1-boundary.md 결정 1).
 */

export type Hex = string

/**
 * 색 역할 — Figma `surf-ui / color` 31 변수와 1:1. 키는 Figma 이름의 camelCase 다.
 *
 * 스킴은 **면 단위** 두 벌이다: 기본은 `light`, `data-surface="ink"` 를 단 요소 안은 `ink`.
 * 한 페이지 안에서 섞는다(홈: 히어로 ink → 아래 묶음 light). OS 다크모드와는 무관하다.
 *
 * `interface` 가 아니라 `type` 인 이유: TS 는 타입 별칭에만 암묵적 인덱스 시그니처를 준다.
 * `interface` 면 `createGlobalThemeContract` 에 shape 으로 넘길 수 없다.
 */
export type ColorScheme = {
  /** 페이지 바닥. ink 는 그라데이션 시작 */
  bgBase: string
  /** ink 그라데이션 끝 · light 띠 번갈아 */
  bgAlt: string
  /** 모달 · 팝오버 · 토스트 · 입력 바닥 */
  surfaceRaised: string
  /** 고르기 카드 · 칩 카드 · 기능 카드 */
  panelFill: string
  panelLine: string
  /** 패널 안 줄 낱장 */
  rowFill: string
  lineDivider: string
  stateHover: string
  statePressed: string
  textPrimary: string
  textSecondary: string
  /** 플레이스홀더 · 비활성. 읽는 글자로 쓰지 않는다 */
  textTertiary: string
  /** 포스터 · 커버 위 글자 */
  textOnMedia: string
  /** Geist 키커 · 줄 행동 글자 */
  kicker: string
  /** 줄 행동 버튼 면 = 키커 14% */
  actionTintFill: string
  actionTintText: string
  /** 주 행동. 화면에 하나 */
  actionPrimary: string
  actionPrimaryHover: string
  actionOnPrimary: string
  /** 주 버튼 면 — 위 → 아래 그라데이션. 단색이 사진 바닥에서 원색으로 튀어서 갈랐다 */
  actionPrimaryTop: string
  actionPrimaryBottom: string
  /** 주 버튼 테두리 1px inside */
  actionPrimaryLine: string
  /** 주 버튼 그림자 — y8 · blur 24 */
  actionPrimaryShadow: string
  /** 포스터 뒤 번짐 */
  glow: string
  /** 스크림 · 포스터 위 그라데이션. 알파를 먹여 쓴다 */
  overlay: string
  statusSuccess: string
  statusSuccessBg: string
  statusWarning: string
  statusWarningBg: string
  statusDanger: string
  statusDangerBg: string
}

/** 잉크 면 — 히어로 · 상세 · 무대. */
const ink: ColorScheme = {
  bgBase: '#0a0f1a',
  bgAlt: '#0b132e',
  surfaceRaised: '#131a2d',
  panelFill: '#131a2d',
  panelLine: 'rgba(255, 255, 255, 0.08)',
  rowFill: 'rgba(255, 255, 255, 0.05)',
  lineDivider: 'rgba(255, 255, 255, 0.08)',
  stateHover: 'rgba(255, 255, 255, 0.06)',
  statePressed: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#ffffff',
  textSecondary: '#99a3b8',
  textTertiary: 'rgba(153, 163, 184, 0.6)',
  textOnMedia: '#ffffff',
  kicker: '#9ec2ff',
  actionTintFill: 'rgba(158, 194, 255, 0.14)',
  actionTintText: '#9ec2ff',
  actionPrimary: '#2563ff',
  actionPrimaryHover: '#1d4fd8',
  actionOnPrimary: '#ffffff',
  actionPrimaryTop: '#3a6dff',
  actionPrimaryBottom: '#1a3a9e',
  actionPrimaryLine: 'rgba(158, 194, 255, 0.25)',
  actionPrimaryShadow: 'rgba(37, 99, 255, 0.25)',
  glow: 'rgba(37, 99, 255, 0.28)',
  overlay: '#0a0f1a',
  statusSuccess: '#5fd08a',
  statusSuccessBg: 'rgba(95, 208, 138, 0.14)',
  statusWarning: '#f0b45a',
  statusWarningBg: 'rgba(240, 180, 90, 0.14)',
  statusDanger: '#ff6b63',
  statusDangerBg: 'rgba(255, 107, 99, 0.14)',
}

/** 밝은 면 — 목록 · 홈 묶음. `:root` 기본값. */
const light: ColorScheme = {
  bgBase: '#ffffff',
  bgAlt: '#f5f7fa',
  surfaceRaised: '#ffffff',
  panelFill: '#eef3ff',
  panelLine: 'rgba(255, 255, 255, 0)',
  rowFill: '#ffffff',
  lineDivider: '#d7dee7',
  stateHover: 'rgba(10, 15, 26, 0.06)',
  statePressed: 'rgba(10, 15, 26, 0.08)',
  textPrimary: '#0a0f1a',
  textSecondary: '#5b6472',
  textTertiary: '#9ca3af',
  textOnMedia: '#ffffff',
  kicker: '#2563ff',
  actionTintFill: 'rgba(37, 99, 255, 0.14)',
  actionTintText: '#2563ff',
  actionPrimary: '#2563ff',
  actionPrimaryHover: '#1d4fd8',
  actionOnPrimary: '#ffffff',
  actionPrimaryTop: '#3a6dff',
  actionPrimaryBottom: '#1a3a9e',
  actionPrimaryLine: 'rgba(158, 194, 255, 0.25)',
  actionPrimaryShadow: 'rgba(37, 99, 255, 0.25)',
  glow: 'rgba(37, 99, 255, 0.28)',
  overlay: '#0a0f1a',
  statusSuccess: '#1f7a3a',
  statusSuccessBg: 'rgba(31, 122, 58, 0.14)',
  statusWarning: '#9a5a12',
  statusWarningBg: 'rgba(154, 90, 18, 0.14)',
  statusDanger: '#b8221c',
  statusDangerBg: 'rgba(184, 34, 28, 0.14)',
}

/** 면 이름 — `data-surface` 속성 값과 같다. */
export type Surface = 'ink' | 'light'

export const colorSchemes: Record<Surface, ColorScheme> = { ink, light }

/**
 * 그림자 — **깊이 축 하나.** 컴포넌트 이름으로 칸을 만들지 않는다.
 *
 * 이 축이 왜 생겼나: DS 자기 컴포넌트가 이미 서로 다른 그림자를 리터럴로 들고 있었다
 * (`Popover`·`Modal`·`Toast`). 축이 없으니 새 그림자가 필요할 때마다 값을 새로 찍는
 * 것 말고 할 수 있는 게 없었고, 그래서 셋이 서로를 모른다.
 *
 * ⚠️ **값을 정규화하지 않았다.** 셋의 기존 값을 그대로 옮기고 깊이 순으로 이름만 붙였다 —
 * 스케일처럼 보이게 하려고 값을 고르면 그 순간 세 컴포넌트에 시각 회귀가 난다.
 * 눈금이 고르지 않은 건 알고 있고, 고르는 건 별도 결정이다.
 *
 * `Checkbox` 의 포커스 링은 여기 없다 — 그건 깊이가 아니라 **포커스 축**이고
 * `color-mix` 로 액센트에서 파생되는 동적 값이다. 같은 이름 아래 두면 축이 섞인다.
 */
export const shadow = {
  /** 카드·노트. 가장 얕다 */
  sm: '0 6px 18px rgba(10, 23, 51, 0.08)',
  /** 떠 있는 작은 면 — `Toast` */
  md: '0 6px 20px rgba(0, 0, 0, 0.18)',
  /** 팝오버·드롭다운 — `Popover` */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  /** 모달 — `Modal` */
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  /** 액센트 CTA. **색이 들어간 유일한 그림자**라 깊이 눈금 밖에 둔다 */
  accent: '0 10px 26px rgba(37, 99, 255, 0.28)',
} as const

/**
 * camelCase 키 → CSS 변수 이름 조각. `bgBase` → `bg-base`, `surface2` → `surface-2`.
 *
 * 소수점은 하이픈으로 접는다(`1.5` → `1-5`). CSS 커스텀 프로퍼티 이름은 `<dashed-ident>` 라
 * `.` 을 그대로 두면 ident 가 거기서 끊긴다.
 */
export const cssVarName = (key: string): string =>
  key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2')
    .replace(/\./g, '-')
    .toLowerCase()

/**
 * 토큰 스케일 → CSS 변수 이름 접두. **이름 규칙의 유일한 정본**이다.
 *
 * 이름을 발행하는 쪽(`theme.css.ts`)과 계약으로 승격하는 쪽(`contract.css.ts`), 소비 레포의
 * codegen 이 이 표 하나를 공유한다. 규칙이 두 벌이면 타입은 통과하고 런타임에 색만 안 나온다.
 *
 * Figma 컬렉션 셋은 `surf` 아래 모인다 — `--surf-bg-base` · `--surf-radius-panel` ·
 * `--surf-layout-gutter`. `layout` 만 접두가 하나 더 붙는다: 모드(mobile · desktop)를 타는 축이라
 * 고정값인 `shape` 와 이름에서 갈린다.
 */
export const cssVarPrefix = {
  color: 'surf',
  layout: 'surf-layout',
  shape: 'surf',
  shadow: 'shadow',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  fontWeight: 'font-weight',
  spacing: 'spacing',
  radius: 'radius',
  cover: 'cover',
} as const

export type TokenScaleGroup = keyof typeof cssVarPrefix

/** 그룹 + 키 → CSS 변수 이름(`--` 제외). `('color', 'bgBase')` → `'surf-bg-base'`. */
export const tokenVarName = (group: TokenScaleGroup, key: string): string => {
  const prefix = cssVarPrefix[group]
  const name = cssVarName(key)
  return prefix ? `${prefix}-${name}` : name
}

/**
 * 인쇄면 스킴 — 종이 위의 `ColorScheme`. 흰 바탕에 검은 잉크가 기준이라 화면 스킴과 값이 따로다.
 *
 * ⚠️ **DS 는 이걸 전역으로 발행하지 않는다.** `@media print` 를 `theme.css.ts` 에 넣으면 인쇄를
 * 쓰지 않는 소비 앱들의 인쇄 결과까지 바뀐다. 값만 내고, 주입은 필요한 앱이 `printThemeVars` 로 한다.
 */
const print: ColorScheme = {
  ...light,
  bgBase: '#ffffff',
  bgAlt: '#ffffff',
  surfaceRaised: '#ffffff',
  panelFill: '#f3f4f6',
  lineDivider: '#dddddd',
  stateHover: '#f3f4f6',
  textPrimary: '#2a2a2a',
  textSecondary: '#4b5563',
  textTertiary: '#9ca3af',
  kicker: '#1d4ed8',
  actionTintText: '#1d4ed8',
  actionPrimary: '#1d4ed8',
  actionPrimaryHover: '#1d4ed8',
  actionPrimaryTop: '#1d4ed8',
  actionPrimaryBottom: '#1d4ed8',
  actionPrimaryLine: 'transparent',
  actionPrimaryShadow: 'transparent',
}

const toColorVars = (scheme: ColorScheme): Record<string, string> =>
  Object.fromEntries(
    (Object.entries(scheme) as Array<[keyof ColorScheme, string]>).map(([k, v]) => [
      `--${tokenVarName('color', k)}`,
      v,
    ]),
  )

/**
 * 면 스킴을 CSS 변수 레코드로 — `{ '--surf-bg-base': '#0a0f1a', … }`.
 * `data-surface` 를 쓸 수 없는 자리(SSR 인라인 · 포털 밖)에서 컨테이너 `style` 로 주입한다.
 */
export const inkSurfaceVars = toColorVars(ink)
export const lightSurfaceVars = toColorVars(light)

/** 인쇄 스킴을 CSS 변수 레코드로 — `@media print` 안에 그대로 붓는다. */
export const printThemeVars = toColorVars(print)

export const fontFamily = {
  /** 본문·UI. 한국어 권위 + Latin 보조. */
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  /** 헤드라인·매거진 마스트헤드. 한글은 Noto Serif KR 로 fallback. */
  serif: "'Instrument Serif', 'Noto Serif KR', 'Times New Roman', serif",
  /** 메타·라벨·코드. 매거진 콜로폰 톤. */
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
  /**
   * 숫자·라틴 소자간 표기. **한글은 절대 이 스택으로 넘기지 않는다** — 글리프가 없다.
   *
   * 앱 셋(`im-coldsurf` · `web-next` · `beam-web`)이 **같은 문자열을 각자** 들고 있었다.
   * 앞의 둘은 `theme.css.ts` 의 같은 줄 번호까지 같다 — 앱이 특이한 게 아니라 여기가 비어 있었다.
   *
   * `sans` 와 역할이 갈린다: 저쪽이 읽는 글이고 이쪽은 **세는 글**(수치·워드마크·메타)이다.
   */
  geist: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
} as const

/**
 * 타이포 스케일 — **rem 단일 축**. 값은 전부 16px root 기준 정수 px 등가다.
 *
 * `3xs`·`2xs` 는 라벨 축이다. 실측(2026-08-04)에서 9~11px 사용의 uppercase 41~68% ·
 * tracking 69~88% · mono 지배가 12px 위와 뚜렷하게 갈렸고, 파일당 1~2종만 쓰여
 * **역할이 실재**했다. 반면 12.5~17px 은 한 파일이 3~5종을 섞어 쓰는 드리프트라
 * 단계를 늘리지 않고 아래 기존 4단계(`xs`·`sm`·`base`·`lg`)로 접는다.
 *
 * px 로 직접 적지 않는 이유: 사용자의 브라우저 기본 글자 크기 설정을 따라가야 한다.
 * 이름에 값을 박지 않는 이유(`13` 같은 키를 쓰지 않는 이유): 토큰의 값을 바꿀 때
 * 사용처를 전부 고쳐야 하면 간접화가 0 이라 토큰이 아니다.
 */
export const fontSize = {
  /** 10px — eyebrow·마이크로 라벨. uppercase + tracking 이 기본 짝. */
  '3xs': '0.625rem',
  /** 11px — mono 메타(수치·코드·콜로폰). */
  '2xs': '0.6875rem',
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
} as const

export const lineHeight = {
  tight: '1.2',
  snug: '1.4',
  normal: '1.6',
  relaxed: '1.75',
} as const

/**
 * 자간 — **본문·UI 축**. 세 단계뿐이고, 크기가 아니라 역할로 고른다.
 *
 * 이 축이 왜 필요했나: `editorialType` 3그룹(eyebrow·display·caption)만 `letterSpacing` 을
 * 갖고 있어서, 본문·UI 는 브라우저 기본값(0)이었다. Pretendard 로 한글을 0 에 두면 글자가
 * 느슨하게 벌어져 같은 크기에서 라틴보다 헐렁하게 읽힌다. 실전에서는 소비처가 자기 CSS 로
 * 메우고 있었다(daily-report `tools/resume-pdf` 가 `--track: -0.02em` 을 body 에 건다).
 *
 * **`editorialType` 의 자간과 겹치지 않는다.** 저쪽은 크기까지 묶은 합성 슬롯(clamp display ·
 * uppercase eyebrow)이고, 이쪽은 어느 크기에든 얹는 단일 속성이다. 합성 슬롯을 쓰는 자리에서는
 * 그쪽 값이 이미 자간을 정하므로 이 토큰을 덧대지 않는다.
 *
 * 근거: coldsurfers/public#106
 */
export const letterSpacing = {
  /** 0 — mono. 고정폭 글리프는 격자가 곧 리듬이라, 조이면 코드·수치가 뭉친다. */
  none: '0',
  /** -0.02em — 본문·UI 기본. 한글 sans 의 기준선. */
  normal: '-0.02em',
  /** -0.03em — 24px 이상 헤드라인. 큰 글자는 더 조여야 같은 무게로 읽힌다. */
  tight: '-0.03em',
} as const

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  /** 700 — 카드 머리 · 줄 제목 · 줄 행동. */
  bold: '700',
  /** 900 — 타일 · 기능 카드 큰 제목. 자간을 −4% 로 함께 조인다. */
  black: '900',
} as const

/**
 * 4px grid — 키는 `4px × N`(Tailwind 수치 스케일과 같은 좌표계).
 *
 * 아래 7단계(`1.5`·`2.5`·`3.5`·`7`·`14`·`20`·`24`)는 2026-08-04 에 **뚫린 구멍을 메운 것**이다.
 * VE 확장 Phase 6(Tailwind → sprinkles) 착수 실측에서 spacing 유틸 2,045건 중 388건(19%)이
 * 이 스케일 밖이었고, 그중 336건이 이 7단계에 몰려 있었다.
 *
 * **왜 이건 "이름에 값이 박히는" 문제가 아닌가.** fontSize 는 `13`·`15` 같은 숫자 키를 거부하고
 * `sm`·`base` 로 접었다(결정 16) — 거기선 이름이 *역할*이고 숫자는 드리프트였기 때문이다.
 * 반면 spacing 은 **처음부터 수치 좌표계**였고, 위 11단계도 같은 격자의 부분집합이었다.
 * 빠진 눈금을 채우는 건 새 명명 철학이 아니라 같은 스케일의 완성이다.
 *
 * 잔여 52건(`0.5`·`9`·`11`·`18`·`28`·`32`·`60`)은 승격하지 않는다 — `style()` 리터럴로 남는다.
 */
export const spacing = {
  '0': '0',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
} as const

/**
 * 눈금은 2 → 4 → 8 → 12 → 16 → 24 로 간다.
 *
 * `2xl`·`3xl` 은 2026-09-19 에 붙였다. 천장이 12px 이라 큰 카드·패널이 전부 리터럴로
 * 새고 있었다 — `apps/im-coldsurf` 와 `apps/web-next` 랜딩 실측에서 16 이 2회, 24 가 5회.
 *
 * ⚠️ **두 앱이 실제로 쓰는 radius 는 이 둘 말고도 14 · 18 · 20 · 28 이 있는데 안 넣었다.**
 * 그것들이 눈금이 아니라 **반응형 짝**이기 때문이다 — 노트 14→16 · 카드 20→24 · 패널 24→28.
 * 짝을 이름 하나로 부르려면 `editorialType` 처럼 합성 슬롯이어야 하고, 그건 눈금이 아니라
 * **프리미티브 층(P3)의 결정**이다. 여기에 14·18·20·28 을 평평하게 늘어놓으면
 * 그건 스케일이 아니라 목록이 된다(AGENTS.md 「흡수에는 상한이 있다」).
 *
 * 그래서 이번엔 *눈금이 이어지는 둘*만 넣는다. 짝은 P3 에서 슬롯으로 정한다.
 * 미결 ⓒ 의 보수적 선택이고, 추가만이라 되돌릴 수 있다 — `docs/palette-layer.md`.
 */
export const radius = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const

/**
 * 커버 팔레트 — 카드 커버 블록의 "지형(terrain)" 색.
 *
 * semantic color 와 달리 **스킴을 타지 않는 불변 scale** 이다. 항상 어두운 필 위에 paper
 * 텍스트/이니셜이 올라가는 에디토리얼 커버(ConcertCard·ArticleCard·LeadFeature)의 바닥색이라,
 * dark 스킴이 살아 있던 때에도 뒤집지 않았다. `--cover-*` 로 `:root` 에, `--color-cover-*` 로 `@theme` 에 fan-out 되어
 * `bg-cover-forest` · `text-cover-plum` 유틸이 생성된다.
 *
 * hex 는 Figma Page 16 커버 블록 무손실 샘플. 키 이름(forest·moss·wine…)은 값이 쿨 계열로
 * 옮겨간 뒤에도 유지한다 — `coverToneFor` 가 `Object.keys` **순서**로 결정적 분산을 하므로
 * 키를 바꾸면 이미 발행된 모든 이벤트의 커버색이 재배치된다. 이름은 색이 아니라 슬롯이다.
 */
export const cover = {
  forest: '#1f3a44',
  wine: '#4a2f42',
  navy: '#2c3e4e',
  moss: '#26305c',
  steel: '#1e2a44',
  plum: '#382c4c',
} as const

export type CoverTone = keyof typeof cover

/**
 * 아티스트 노드 색면 여덟 — taste engine 의 노드가 이름 해시로 하나를 고른다.
 *
 * `cover` 와 **겹치지 않는 별개 축**이다. 셋을 구별한다:
 *   - `cover` 는 6톤 전부 틴트가 있고, 이벤트 표지 한 장을 채우는 색면이다
 *   - 여기는 **중성 다크 셋**(`slate`·`graphite`·`iron`)을 포함한다. 노드가 여럿 붙어 있는
 *     화면이라 톤이 골고루 퍼져야 하고, 전부 틴트를 주면 화면이 알록달록해진다
 *   - 목적이 **여덟이 서로 갈리는 것**이라 6으로 줄이면 목적이 깨진다
 *
 * 값 출처는 `apps/web-next` 의 `TasteEngine` 이다. flag 가 prod 에 켜져 있어 관객에게 실제로
 * 보이는 살아있는 표면 값이고, 그래서 앱이 아니라 여기가 정본이어야 한다.
 */
export const nodeTone = {
  teal: '#1c3038',
  wine: '#331f30',
  slate: '#22262b',
  violet: '#272040',
  navy: '#1f2b38',
  graphite: '#22292e',
  iron: '#2b2b33',
  steel: '#333847',
} as const

export type NodeTone = keyof typeof nodeTone

/**
 * 에디토리얼 typography — 매거진 톤의 합성 타이포 슬롯.
 *
 * `apps/web-next` 에 54회 흩어진 `text-[10.5px] tracking-[0.26em] uppercase` 류를
 * 한 어휘로 묶는다. Tailwind `@theme` 의 `--text-{group}-{size}` 로 fan-out 되어
 * `text-eyebrow-md` · `text-display-lg` utility 가 자동 생성된다.
 *
 * `textTransform` 은 Tailwind `--text-*` 네임스페이스가 표현하지 못한다(@theme 제외).
 * 의미 기록용으로만 남기고, 실제 `uppercase` 는 L2 recipe(`font-mono uppercase`)가 적용한다.
 *
 * **크기는 여기서 정하지 않고 `fontSize` 를 읽는다.** 이 슬롯이 px 리터럴을 들고 있던 동안
 * 타이포 값의 SSOT 가 rem 축과 px 축으로 갈라져 있었다(2026-06-28~08-04). 자기 값을 갖는 건
 * `letterSpacing`·`lineHeight` 뿐이다 — 그건 크기 축과 직교한다.
 *
 * `display` 의 `clamp()` 만 예외다. 저건 스케일의 *단계*가 아니라 뷰포트를 따라 흐르는
 * 유동 타입이라 애초에 축 위에 없다.
 */
export interface EditorialTypeStyle {
  fontSize: string
  lineHeight?: string
  letterSpacing?: string
  textTransform?: 'uppercase'
}

export const editorialType: Record<string, Record<string, EditorialTypeStyle>> = {
  eyebrow: {
    xs: { fontSize: fontSize['3xs'], letterSpacing: '0.18em', textTransform: 'uppercase' },
    sm: { fontSize: fontSize['2xs'], letterSpacing: '0.20em', textTransform: 'uppercase' },
    md: { fontSize: fontSize.xs, letterSpacing: '0.26em', textTransform: 'uppercase' },
  },
  display: {
    lg: { fontSize: 'clamp(34px, 6vw, 88px)', lineHeight: '1.02', letterSpacing: '-0.02em' },
    md: { fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: '1.05', letterSpacing: '-0.018em' },
  },
  caption: {
    /** 0.7rem(11.2px) 이던 축 밖 값 — `2xs`(11px)로 접었다. 0.2px 차이. */
    sm: { fontSize: fontSize['2xs'], letterSpacing: '0.12em', textTransform: 'uppercase' },
  },
}

/**
 * 의미 기반 breakpoint. admin 운영 시점을 기준으로 한다.
 *   mobile  — 한 손 운영 (스캐너 · 입장 현장)
 *   tablet  — 양 손 (현장 데스크 / 카운터)
 *   desktop — 사무실
 *
 * Tailwind v4 의 `@theme --breakpoint-{name}` 으로 매핑되면 `mobile:`, `tablet:`,
 * `desktop:` variant 가 자동 생성된다. 기존 Tailwind 기본 `sm/md/lg` 와 공존.
 */
export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
} as const

/**
 * layout — Figma `surf-ui / layout`. 모드 둘: `mobile`(기본) · `desktop`(`breakpoints.desktop` 이상).
 * 같은 이름이 폭에 따라 값을 바꾼다 — 소비자는 `vars.layout.gutter` 하나만 쓴다.
 */
export type LayoutScale = {
  gutter: string
  contentWidth: string
  sectionY: string
  repeatGap: string
  heroPosterHeight: string
  heroDecisionWidth: string
  heroColumnGap: string
  typeHeroTitle: string
  typeTileTitle: string
}

export const layout: Record<'mobile' | 'desktop', LayoutScale> = {
  mobile: {
    gutter: '20px',
    contentWidth: '350px',
    sectionY: '56px',
    repeatGap: '12px',
    heroPosterHeight: '300px',
    heroDecisionWidth: '350px',
    heroColumnGap: '20px',
    typeHeroTitle: '36px',
    typeTileTitle: '18px',
  },
  desktop: {
    gutter: '64px',
    contentWidth: '1312px',
    sectionY: '96px',
    repeatGap: '24px',
    heroPosterHeight: '660px',
    heroDecisionWidth: '500px',
    heroColumnGap: '56px',
    typeHeroTitle: '56px',
    typeTileTitle: '22px',
  },
}

/**
 * shape — Figma `surf-ui / shape`. 모드 없는 고정값. 부품의 모서리 · 고정 크기 · 글자 크기.
 *
 * 옛 `radius` 눈금(`sm`~`3xl`)과 다른 축이다 — 저쪽은 열린 스케일이고, 이쪽은 *어느 부품의*
 * 모서리인지를 이름으로 갖는다. 부품을 만들 땐 이쪽을 쓴다.
 */
export const shape = {
  radiusPanel: '20px',
  radiusSheet: '28px',
  radiusPoster: '24px',
  radiusRow: '12px',
  radiusRowAction: '8px',
  radiusPill: '9999px',
  sizeRowActionHeight: '32px',
  sizeDateBlockWidth: '52px',
  sizeDateBlockHeight: '62px',
  sizeThumb: '52px',
  typeKicker: '11px',
  typeCardHead: '16px',
  typeRowTitle: '15px',
  typeBody: '14px',
  typeMeta: '12px',
} as const

export const tokens = {
  color: colorSchemes,
  layout,
  shape,
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  spacing,
  radius,
  shadow,
  cover,
  nodeTone,
  editorialType,
  breakpoints,
} as const

export type Tokens = typeof tokens
