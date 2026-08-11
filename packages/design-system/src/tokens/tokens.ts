/**
 * 토큰 **값**의 SSOT. 이 TS 객체가 정본이고, CSS 변수는 여기서 파생된다.
 *
 * 파생 경로는 둘이다:
 *   - 이 패키지의 `../css/theme.css.ts` — VE 가 `styles.css` 로 굽는다(소비자가 쓰는 길)
 *   - 소비 레포의 codegen — 이 파일이 export 하는 `tokenVarName` 을 읽어 자기 앱용 CSS 를 만든다
 *     (Tailwind `@theme` 매핑처럼 공개 API 에 넣을 수 없는 산출물. 근거는 docs/p1-boundary.md 결정 4)
 *
 * 시맨틱 색 키는 camelCase → kebab-case 로 CSS 커스텀 프로퍼티가 된다
 * (숫자는 분리: `surface2` → `--surface-2`).
 *
 * **어느 축을 소비자가 덮을 수 있는가** 는 docs/p1-boundary.md 결정 1 이 정한다:
 * spacing·radius·fontSize·lineHeight·fontWeight·fontFamily·breakpoints 는 열려 있고,
 * color·cover·paper·editorialType 은 COLDSURF 고정값이다.
 */

export type Hex = string

/**
 * `interface` 가 아니라 `type` 인 이유: TS 는 타입 별칭에만 암묵적 인덱스 시그니처를 준다.
 * `interface` 면 `createGlobalThemeContract` 의 `NullableTokens` 에 대입되지 않아
 * design-system 계약이 이 스키마를 그대로 shape 으로 넘길 수 없다.
 */
export type ColorScheme = {
  // surfaces
  bg: string
  surface: string
  surface2: string
  surfaceHover: string
  surfaceGhost: string
  surfaceGhostHover: string
  surfaceActive: string
  border: string
  borderSoft: string
  // text
  text: string
  strong: string
  body: string
  muted: string
  subtle: string
  faint: string
  // accent
  heading: string
  accent: string
  accentHover: string
  link: string
  linkHover: string
  blockquote: string
  // code
  codeBg: string
  codeFg: string
  // status
  statusSuccess: string
  statusSuccessBg: string
  statusWarning: string
  statusWarningBg: string
  statusDanger: string
  statusDangerBg: string
}

/**
 * COLDSURF brand palette
 *   paper   #f2efe8 · paper-2 #e9e5db · rule #d8d2c5
 *   ink     #111111 · ink-soft #1c1c1a
 *   muted   #6b6b66 · subtle #aea99e
 *   sweep   #e5322b · sweep-deep #b8221c
 *
 * sweep red 는 "Pick 호수·편집 액션" 한 자리에만 쓰는 강조색이다.
 * 본문 link 는 ink 로 두고, hover 시에만 sweep 를 노출한다.
 *
 * ─── off-white 이름 사전 (하나의 이름은 하나의 값만 가리킨다) ───
 *   paper        #f2efe8   위 브랜드 정본. `light.bg` 와 같은 값
 *   warm-paper   #fafaf7   Figma 시안의 라이트 고정 표면. 아래 `paper.warm` 토큰
 *
 * 둘은 다른 색이고 다른 표면이다 — 통일 대상이 아니라 *구별* 대상이다.
 * 새 off-white 를 들일 땐 값을 재사용하기 전에 여기에 이름부터 추가한다.
 */
const dark: ColorScheme = {
  bg: '#111111',
  surface: '#1c1c1a',
  surface2: '#161614',
  surfaceHover: '#22221f',
  surfaceGhost: 'rgba(242, 239, 232, 0.04)',
  surfaceGhostHover: 'rgba(242, 239, 232, 0.08)',
  surfaceActive: 'rgba(242, 239, 232, 0.12)',
  border: '#2a2a26',
  borderSoft: '#1f1f1c',

  text: '#f2efe8',
  strong: '#ffffff',
  body: '#d8d2c5',
  muted: '#aea99e',
  subtle: '#7a766c',
  faint: '#3a3a36',

  heading: '#f2efe8',
  accent: '#d6451f',
  accentHover: '#f0592e',
  link: '#f2efe8',
  linkHover: '#d6451f',
  blockquote: '#aea99e',

  codeBg: '#1c1c1a',
  codeFg: '#d6451f',

  statusSuccess: '#5ad27a',
  statusSuccessBg: 'rgba(90, 210, 122, 0.14)',
  statusWarning: '#f3b14a',
  statusWarningBg: 'rgba(243, 177, 74, 0.14)',
  statusDanger: '#e5322b',
  statusDangerBg: 'rgba(229, 50, 43, 0.16)',
}

const light: ColorScheme = {
  bg: '#f2efe8',
  surface: '#ffffff',
  surface2: '#e9e5db',
  surfaceHover: '#ece8de',
  surfaceGhost: 'rgba(17, 17, 17, 0.03)',
  surfaceGhostHover: 'rgba(17, 17, 17, 0.06)',
  surfaceActive: 'rgba(17, 17, 17, 0.08)',
  border: '#d8d2c5',
  borderSoft: '#e9e5db',

  text: '#111111',
  strong: '#0a0a0a',
  body: '#2a2a26',
  muted: '#6b6b66',
  subtle: '#aea99e',
  faint: '#d8d2c5',

  heading: '#111111',
  accent: '#d6451f',
  accentHover: '#b3360f',
  link: '#111111',
  linkHover: '#d6451f',
  blockquote: '#444444',

  codeBg: '#e9e5db',
  codeFg: '#b3360f',

  statusSuccess: '#1f7a3a',
  statusSuccessBg: 'rgba(31, 122, 58, 0.14)',
  statusWarning: '#9a5a12',
  statusWarningBg: 'rgba(154, 90, 18, 0.14)',
  statusDanger: '#b8221c',
  statusDangerBg: 'rgba(184, 34, 28, 0.14)',
}

/**
 * camelCase 시맨틱 키 → CSS 변수 이름 조각. `surface2` → `surface-2`. generate.ts 와 공유.
 *
 * 소수점은 하이픈으로 접는다(`1.5` → `1-5`). CSS 커스텀 프로퍼티 이름은 `<dashed-ident>` 라
 * `.` 을 그대로 두면 ident 가 거기서 끊겨 `--spacing-1.5: …` 가 파스 에러가 된다.
 * spacing 반 눈금(`1.5`·`2.5`·`3.5`)이 생기면서 필요해졌다.
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
 * 이름을 *발행*하는 쪽과 *계약*으로 승격하는 쪽이 이 표 하나를 공유한다. 규칙이 두 벌이면
 * 어긋나도 타입은 통과하고 런타임에 `var(--없는이름)` 이 되어 색만 안 나온다.
 *
 * 그래서 이 표는 **패키지 밖으로도 export 된다.** 소비 레포의 codegen 이 자기 CSS 를 만들 때
 * 이름을 다시 적으면 같은 병이 레포 경계를 넘어 재발한다 — 함수를 가져다 쓰게 한다.
 *
 * `color` 만 접두가 없다 — `--bg` · `--text` 처럼 시맨틱 이름이 곧 변수 이름이다.
 * (Tailwind `@theme` 의 `--text-*` · `--spacing-*` 네임스페이스는 이것과 다른 축이다.
 *  저건 Tailwind 가 정한 이름이라 여기 표에 속하지 않는다.)
 */
export const cssVarPrefix = {
  color: '',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  fontWeight: 'font-weight',
  spacing: 'spacing',
  radius: 'radius',
  cover: 'cover',
  paper: 'paper',
} as const

export type TokenScaleGroup = keyof typeof cssVarPrefix

/** 그룹 + 키 → CSS 변수 이름(`--` 제외). `('fontSize', '2xs')` → `'font-size-2xs'`. */
export const tokenVarName = (group: TokenScaleGroup, key: string): string => {
  const prefix = cssVarPrefix[group]
  const name = cssVarName(key)
  return prefix ? `${prefix}-${name}` : name
}

/**
 * light(paper) 스킴을 CSS 변수 레코드로 — `{ '--bg': '#f2efe8', '--text': '#111111', … }`.
 * 전역 테마와 무관하게 특정 서브트리를 paper 로 고정할 때 컨테이너 `style` 로 주입한다.
 * MVP 랜딩 표면은 시안 기준 항상 light. SSR 인라인이라 플래시 없음.
 */
export const lightThemeVars: Record<string, string> = Object.fromEntries(
  (Object.entries(light) as Array<[keyof ColorScheme, string]>).map(([k, v]) => [
    `--${tokenVarName('color', k)}`,
    v,
  ]),
)

export const fontFamily = {
  /** 본문·UI. 한국어 권위 + Latin 보조. */
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  /** 헤드라인·매거진 마스트헤드. 한글은 Noto Serif KR 로 fallback. */
  serif: "'Instrument Serif', 'Noto Serif KR', 'Times New Roman', serif",
  /** 메타·라벨·코드. 매거진 콜로폰 톤. */
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
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

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
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

export const radius = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const

/**
 * 커버 팔레트 — 카드 커버 블록의 "지형(terrain)" 색.
 *
 * dark↔light 스왑이 없는 **불변 scale** 이다. 항상 어두운 필 위에 paper 텍스트/이니셜이
 * 올라가는 에디토리얼 커버(ConcertCard·ArticleCard·LeadFeature)의 바닥색이라, 스킴을 따라
 * 뒤집지 않는다. `--cover-*` 로 `:root` 에, `--color-cover-*` 로 `@theme` 에 fan-out 되어
 * `bg-cover-forest` · `text-cover-plum` 유틸이 생성된다.
 *
 * hex 는 Figma Page 7 커버 블록 무손실 샘플.
 */
export const cover = {
  forest: '#29423d',
  wine: '#522e33',
  navy: '#333847',
  moss: '#473d24',
  steel: '#2e334c',
  plum: '#3d2942',
} as const

export type CoverTone = keyof typeof cover

/**
 * warm paper — Figma 시안의 **라이트 고정 표면** 바닥색.
 *
 * `cover` 와 같은 성격의 **스킴 불변 scale** 이다. 이벤트 상세·`/live-events`·`/magazine`(b-side)·
 * pick 상세는 시안이 라이트 전용이라 전역 다크 토글과 무관하게 항상 이 색 위에 산다.
 * 그래서 dark↔light 가 스왑하는 semantic color(`bg`·`surface`)가 아니라 별도 이름을 갖는다.
 *
 * 브랜드 정본 paper(`#f2efe8` = `light.bg`)와는 **다른 값·다른 이름**이다. 위 이름 사전 참조.
 * `--paper-warm` 으로 `:root` 에, `--color-paper-warm` 으로 `@theme` 에 fan-out 되어
 * `bg-paper-warm` 유틸이 생성된다.
 */
export const paper = {
  warm: '#fafaf7',
} as const

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

export const tokens = {
  color: {
    semantic: { dark, light },
  },
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  spacing,
  radius,
  cover,
  paper,
  editorialType,
  breakpoints,
} as const

export type Tokens = typeof tokens
