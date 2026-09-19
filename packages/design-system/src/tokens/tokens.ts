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
 * spacing·radius·fontSize·lineHeight·letterSpacing·fontWeight·fontFamily·breakpoints 는 열려 있고,
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
 * COLDSURF 원색 — **hex 정본.** 아래 `light` · `ink` 는 전부 여기서 파생한다.
 *
 * 정본은 Figma Playground-Dev-CM Page 16 의 팔레트 보드다. 앞 열이 보드 10색이고,
 * 뒤 열은 보드 밖 파생색으로 `apps/im-coldsurf` 랜딩에서 실제로 필요해 생긴 값이다.
 *
 * ─── 왜 이 층이 따로 있는가 ───
 * 의미이름(`--bg`·`--text`)은 *역할*을 말한다. 그런데 역할 이름이 안 붙는 자리가 있다 —
 * 그라디언트 정지색, 잉크 밴드 안의 타일 바닥, 내비 글자처럼 "그 색이어서 그 색인" 자리다.
 * 그런 자리를 의미이름으로 부르면 거짓말이 되고(`--surface` 가 그라디언트 끝일 리 없다),
 * 리터럴로 쓰면 팔레트가 움직일 때 혼자 뒤처진다. 그래서 **원색에도 이름을 준다.**
 *
 * 앱 셋이 이 층을 각자 팠던 것이 근거다 — `im-coldsurf` 가 `--cs-*` 18색,
 * `beam-web` 이 `--beam-*` 8색, `web-next` 가 `--cs-grad-hero` 하나.
 * 셋 다 구조가 같았다(원색 선언 → 의미이름에 먹임). 앱이 특이한 게 아니라 여기가 비어 있었다.
 * 설계·실측: `docs/palette-layer.md`
 *
 * ─── 쓰는 규율 ───
 * **의미이름이 있는 자리에 원색을 쓰지 않는다.** 본문 글자는 `palette.deepNight` 이 아니라
 * `color.text` 다 — 둘은 지금 같은 값이지만 같은 뜻이 아니고, 역할이 움직일 때 갈린다.
 * 원색은 *역할 이름이 없는 자리*의 탈출구이지 의미층의 대체재가 아니다.
 *
 * CSS 변수는 `--cs-*` 로 발행된다(`cssVarPrefix.palette`). RN 은 `./native.ts` 가 그대로 재수출한다.
 */
export const palette = {
  // ─── 보드 10색 ───
  /** Deep Night. 본문 글자이자 잉크 밴드 바닥 */
  deepNight: '#0a0f1a',
  /** 잉크 밴드 위 카드·칩·검색바 */
  card: '#161e2e',
  /** 잉크 밴드 위 구분선. 라이트에서는 긴 본문 글자색 */
  divider: '#263248',
  /** Glacier. 틴트 면·코드 바닥 */
  glacier: '#eaf6ff',
  white: '#ffffff',
  /** Surf Blue. 주 액션·링크 hover. **화면당 하나** */
  surfBlue: '#2563ff',
  /** Ice Blue. 잉크 밴드 위 링크·인디케이터. 라이트 표면에서는 쓰지 않는다 */
  iceBlue: '#7dd3fc',
  /** 구분선·플레이스홀더·비활성. ⚠️ 읽는 글자로 쓰지 않는다(surface 위 2.54:1) */
  mist: '#9ca3af',
  /** 보조 글자. **읽는 글자의 하한선**(surface 위 5.98:1) */
  slate: '#5b6472',
  haze: '#c3cbd6',

  // ─── 파생 (보드 밖) ───
  /** 페이지 바닥. `light.bg` 와 같은 값 */
  paper: '#f5f7fa',
  /** 가라앉은 라이트 면. ⚠️ `light.surfaceHover`(#eef2f7)와 **다른 값**이다 — 미결 ⓑ */
  paperSunk: '#edf1f6',
  /** 라이트 구분선. ⚠️ `light.borderSoft`(#e5ebf2)와 **다른 값**이다 — 미결 ⓑ */
  hairline: '#dce3eb',
  /** 진한 라이트 구분선. `light.border` 와 같은 값 */
  hairlineStrong: '#d7dee7',
  /** 히어로 그라디언트의 끝. deepNight 에서 푸르게 한 단 뜬다 */
  nightDeep: '#0b132e',
  /** 아티스트 카드 바닥 */
  cardDeep: '#101a2e',
  /** 숫자 타일 바탕. 잉크 위에 얹히므로 card 보다 한 단 어둡다 */
  tile: '#111a2b',
  /** 잉크 밴드 위 내비 글자 */
  navText: '#e5e7eb',

  // ─── 인디케이터 (보드 밖) ───
  /*
   * 레일·상태 색점용 **채도 있는** 셋. `cover` 6톤을 못 쓰는 이유는 면적이다 — 그쪽은
   * 색면용 어두운 톤이라 8px 점으로 줄이면 넷이 다 같은 검정으로 뭉친다(web-next
   * `/live-events` 실측). 점은 채도가 있어야 서로 갈린다.
   *
   * 넷 중 첫 자리는 `surfBlue` 가 겸한다 — 첫 레일이 브랜드색인 건 의도다. 그래서 여기 셋뿐이다.
   */
  /** 색점 — 시안. `surfBlue` 다음 자리 */
  lagoon: '#0e9cc4',
  /** 색점 — 틸그린 */
  pine: '#2f9e6f',
  /** 색점 — 바이올렛 */
  iris: '#7159d9',
  /** 모달·시트 뒤에 까는 막. deepNight 를 그대로 흐린 값이라 여기 둔다 */
  scrim: 'rgba(10, 15, 26, 0.64)',
} as const

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
 * 표면 그라디언트 — Figma Page 16 시안의 `gradientTransform` 을 그대로 옮겼다.
 *
 * 각도가 둘뿐인 게 규칙이다 — **히어로만 세로(180deg), 나머지는 전부 대각(135deg).**
 *
 * 정지색에 이름을 주지 않았다. 소비처가 이 값 안뿐이라 이름이 값보다 짧지 않고,
 * 팔레트에 올리면 "쓰이지 않는 이름" 이 다섯 늘어난다. 팔레트는 *부를 일이 있는* 색만 담는다.
 *
 * `cover` 6톤과 헷갈리지 않는다 — 저쪽은 데이터로 정해지는 표지 색이고 여기는 고정 표면이다.
 */
export const gradient = {
  /** 히어로 밴드. 유일한 세로 */
  hero: 'linear-gradient(180deg, #0a0f1a 0%, #0b132e 100%)',
  show: 'linear-gradient(135deg, #eaf6ff 0%, #c7e4ff 100%)',
  artist: 'linear-gradient(135deg, #101a2e 0%, #0a0f1a 100%)',
  venue: 'linear-gradient(135deg, #dceeff 0%, #eaf6ff 100%)',
  ticket: 'linear-gradient(135deg, #f1f5f9 0%, #e3edf7 100%)',
  panel: 'linear-gradient(135deg, #eaf6ff 0%, #dde9ff 100%)',
} as const

/**
 * COLDSURF brand palette — **스킴은 이 하나(paper)뿐이다.**
 * ink(dark) 스킴은 폐기했다(paul-rockstar #299). 색을 뒤집는 축이 없으므로 `light` 가 곧 `:root` 다.
 *   paper   #f5f7fa · paper-2 #eaf6ff · rule #d7dee7
 *   ink     #0a0f1a · ink-soft #263248
 *   muted   #5b6472 · subtle #9ca3af
 *   surf    #2563ff · surf-deep #1d4fd8
 *
 * surf blue 는 주 액션·링크 hover·코드 강조에 쓰는 브랜드 강조색이다.
 * 본문 link 는 ink 로 두고, hover 시에만 surf 를 노출한다.
 *
 * ─── off-white 이름 사전 (하나의 이름은 하나의 값만 가리킨다) ───
 *   paper        #f5f7fa   위 브랜드 정본. `light.bg` 와 같은 값
 *   warm-paper   #f9fbfd   Figma 시안의 라이트 고정 표면. 아래 `paper.warm` 토큰
 *                          (키는 역사적 이름이다 — 값은 더 이상 warm 계열이 아니다)
 *
 * 둘은 다른 색이고 다른 표면이다 — 통일 대상이 아니라 *구별* 대상이다.
 * 새 off-white 를 들일 땐 값을 재사용하기 전에 여기에 이름부터 추가한다.
 *
 * ─── 잉크 넷 중 어디까지가 "읽는 글자" 인가 ───
 *   text    #0a0f1a   본문·제목
 *   body    #263248   긴 본문
 *   muted   #5b6472   보조. surface 위 5.98:1 — **읽는 글자의 하한선**
 *   subtle  #9ca3af   구분선·플레이스홀더·비활성. surface 위 2.54:1
 *
 * **`subtle` 로 읽는 글자를 찍지 않는다.** WCAG AA 는 4.5:1 인데(18.66px bold·24px 이상만 3:1)
 * 실측은 surface 위 2.54 · bg 위 2.36 · paper-warm 위 2.48 다. 보조 문구·라벨·캡션까지
 * 전부 `muted` 가 하한이고, `subtle` 은 *읽히지 않아도 되는 것*(구분선·placeholder·비활성)에만 쓴다.
 * cover scale 처럼 어두운 색면 위에서는 대비가 반대로 성립하므로 그쪽은 예외다.
 *
 * 값을 어둡게 옮기지 않는 이유: 구분선·비활성 자리에선 지금 값이 맞고, 소비처가 165곳
 * (public 35 · paul-rockstar 130)이라 값을 옮기면 읽는 글자가 아닌 자리까지 같이 움직인다.
 * 근거·실측: coldsurfers/public#106
 */
/*
 * 값은 하나도 안 바뀌었다 — 리터럴이 `palette` 참조로 바뀐 것뿐이다(런타임엔 같은 hex 문자열).
 * 아직 리터럴인 자리는 **팔레트에 대응 색이 없는 자리**이고, 각각 사유를 달아 뒀다.
 */
const light: ColorScheme = {
  bg: palette.paper,
  surface: palette.white,
  surface2: palette.glacier,
  /** ⚠️ `palette.paperSunk`(#edf1f6)와 1단위 차. 합칠지는 미결 ⓑ — 지금은 구별한다 */
  surfaceHover: '#eef2f7',
  surfaceGhost: 'rgba(10, 15, 26, 0.03)',
  surfaceGhostHover: 'rgba(10, 15, 26, 0.06)',
  surfaceActive: 'rgba(10, 15, 26, 0.08)',
  border: palette.hairlineStrong,
  /** ⚠️ `palette.hairline`(#dce3eb)과 다른 값. 미결 ⓑ */
  borderSoft: '#e5ebf2',

  text: palette.deepNight,
  /** 보드에 없는 값 — deepNight 보다 한 단 더 검다. 접을지는 미결 ⓔ */
  strong: '#05090f',
  body: palette.divider,
  muted: palette.slate,
  subtle: palette.mist,
  faint: palette.haze,

  heading: palette.deepNight,
  accent: palette.surfBlue,
  /** surf-deep. 보드에 없다 */
  accentHover: '#1d4fd8',
  link: palette.deepNight,
  linkHover: palette.surfBlue,
  blockquote: '#3f4a5c',

  codeBg: palette.glacier,
  codeFg: '#1d4fd8',

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
  /** 원색층. `('palette','deepNight')` → `--cs-deep-night`. 의미이름(접두 없음)과 한눈에 갈린다 */
  palette: 'cs',
  shadow: 'shadow',
  gradient: 'gradient',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  fontWeight: 'font-weight',
  spacing: 'spacing',
  radius: 'radius',
  cover: 'cover',
  paper: 'paper',
  ink: 'ink',
} as const

export type TokenScaleGroup = keyof typeof cssVarPrefix

/** 그룹 + 키 → CSS 변수 이름(`--` 제외). `('fontSize', '2xs')` → `'font-size-2xs'`. */
export const tokenVarName = (group: TokenScaleGroup, key: string): string => {
  const prefix = cssVarPrefix[group]
  const name = cssVarName(key)
  return prefix ? `${prefix}-${name}` : name
}

/**
 * 인쇄면 스킴 — 종이 위의 `ColorScheme`.
 *
 * 화면 스킴에서 파생되지 않는다. 종이는 흰 바탕에 검은 잉크가 기준이고, `bg`(#f5f7fa) 같은
 * 화면 표면색을 그대로 인쇄하면 잉크만 먹는다. 그래서 값이 따로 있다.
 *
 * ⚠️ **DS 는 이걸 전역으로 발행하지 않는다.** `@media print` 블록을 `theme.css.ts` 에 넣으면
 * 인쇄를 쓰지 않는 소비 앱들의 인쇄 결과까지 바뀐다. 값만 내고, 주입은 필요한 앱이
 * 아래 `printThemeVars` 로 한다(현재 소비처: `apps/web-next`).
 *
 * 값 출처는 그 앱의 `styles.css` 였다. 화면과 다른 축이라 원색층(`palette`)에서도 파생되지
 * 않는다 — 여기 hex 가 있는 게 정상이다.
 */
const print: ColorScheme = {
  ...light,

  bg: '#ffffff',
  surface: '#ffffff',
  surface2: '#f3f4f6',
  surfaceHover: '#f3f4f6',
  border: '#dddddd',
  borderSoft: '#eeeeee',

  text: '#2a2a2a',
  strong: '#1f2937',
  body: '#2a2a2a',
  muted: '#4b5563',
  subtle: '#6b7280',
  faint: '#9ca3af',

  heading: '#0a0a0a',
  accent: '#1d4ed8',
  accentHover: '#1d4ed8',
  link: '#1d4ed8',
  linkHover: '#1d4ed8',
  blockquote: '#444444',
  codeBg: '#f3f4f6',
  codeFg: '#1d4ed8',
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

/**
 * 인쇄 스킴을 CSS 변수 레코드로 — `@media print` 안에 그대로 붓는다.
 * VE 라면 `globalStyle(':root', { '@media': { print: { vars: printThemeVars } } })` 가 그 자리다.
 */
export const printThemeVars: Record<string, string> = Object.fromEntries(
  (Object.entries(print) as Array<[keyof ColorScheme, string]>).map(([k, v]) => [
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
 * warm paper — Figma 시안의 **라이트 고정 표면** 바닥색.
 *
 * `cover` 와 같은 성격의 **스킴 불변 scale** 이다. 이벤트 상세·`/live-events`·`/magazine`(b-side)·
 * pick 상세는 시안이 라이트 전용이라 항상 이 색 위에 산다. 그래서 스킴을 타는 자리였던
 * semantic color(`bg`·`surface`)가 아니라 별도 이름을 갖는다.
 *
 * 브랜드 정본 paper(`#f5f7fa` = `light.bg`)와는 **다른 값·다른 이름**이다. 위 이름 사전 참조.
 * `--paper-warm` 으로 `:root` 에, `--color-paper-warm` 으로 `@theme` 에 fan-out 되어
 * `bg-paper-warm` 유틸이 생성된다.
 */
export const paper = {
  warm: '#f9fbfd',
} as const

/**
 * ink — **다크 밴드**의 색 넷. `cover`·`paper` 와 같은 성격의 스킴 불변 scale 이다.
 *
 * 랜딩·이벤트 상세는 라이트 고정이지만 그 안에서 헤더·히어로·캡처 밴드처럼 *한 구간만*
 * 어둡게 눕는 자리가 있다(Figma Page 16 시안). 전역 스킴을 뒤집는 축이 아니므로
 * ink(dark) 스킴 폐기 결정(paul-rockstar #299)은 그대로 두고, 그 구간이 쓰는 색만 상수로 낸다.
 *
 * `base` 는 `light.text` 와 같은 hex 다 — 라이트에선 글자, 다크 밴드에선 바닥인 한 색이다.
 * `border` 도 `light.body` 와 같다. 이름이 겹치는 게 아니라 **역할이 둘인 값**이라 양쪽에 둔다.
 *
 * 밴드 위 글자는 `surface`(#161e2e) 기준 White 15.9:1 · `subtle` 4.4:1 로 둘 다 AA 를 넘는다.
 * `accent`(Ice Blue) 는 밴드 위 링크·인디케이터 전용이다 — 라이트 위에선 1.6:1 이라 쓰지 않는다.
 *
 * `--ink-*` 로 `:root` 에 fan-out 된다.
 */
export const ink = {
  /** Deep Night — 밴드 바닥. `light.text` 와 같은 값 */
  base: palette.deepNight,
  /** 밴드 위 카드·칩·검색바 */
  surface: palette.card,
  /** 밴드 위 구분선·2차 버튼 테두리. `light.body` 와 같은 값 */
  border: palette.divider,
  /** Ice Blue — 밴드 위 링크·인디케이터. 라이트 표면에서는 쓰지 않는다 */
  accent: palette.iceBlue,
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
    semantic: { light },
  },
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
  spacing,
  radius,
  palette,
  shadow,
  gradient,
  cover,
  paper,
  /**
   * ⚠️ 여기 빠져 있었다. `theme.css.ts` 는 `assignVars(vars.ink, ink)` 로 `--ink-*` 를
   * 발행하는데 이 집계에는 없어서, 이 객체를 파생 원본으로 쓰는 `./native.ts` 에도 안 실렸다.
   * 결과: **RN 은 다크 밴드 색 넷을 못 읽는다.** 웹만 보면 드러나지 않던 구멍이다.
   */
  ink,
  editorialType,
  breakpoints,
} as const

export type Tokens = typeof tokens
