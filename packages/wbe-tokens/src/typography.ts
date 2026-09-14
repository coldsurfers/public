/**
 * 활자 — 셋이 역할을 나눠 갖는다.
 *   display  Archivo Black    마스트헤드·아티스트명·장부 값·트랙 제목
 *   mono     IBM Plex Mono    섹션 헤드·라벨·캡션·카탈로그 번호
 *   body     Noto Sans KR     한국어 산문
 *
 * 둘 다 OFL 이라 웹폰트로 실을 수 있다. 패키지는 파일을 싣지 않고 이름만 갖는다.
 *
 * `display` · `mono` 는 **영문 전용**이다 — 한글 글리프가 없다. 폰트 대체는 글자 단위라
 * 한글이 섞여 들어오면 그 글자만 뒤로 넘어가는데, 체인 끝이 `sans-serif` 면 기기마다
 * 다른 시스템 폰트가 나온다. 그래서 셋 다 `Noto Sans KR`(= `body` 의 얼굴)로 받는다.
 */
export const fontFamily = {
  display: "'Archivo Black', 'Arial Black', 'Noto Sans KR', Helvetica, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, 'Noto Sans KR', monospace",
  body: "'Noto Sans KR', system-ui, -apple-system, sans-serif",
} as const

/** px. 시안(1440 데스크톱)에서 실제로 쓰인 단만 갖는다 — 안 쓰는 단은 만들지 않는다. */
export const fontSize = {
  /** 마스트헤드 `WHITE BLIND EYE`. */
  display: 136,
  /** 장부 값 `03` · `OPEN`. */
  metric: 34,
  /** 로스터 아티스트명. */
  artist: 30,
  /** 트랙 테이블 행 제목. */
  row: 22,
  /** 한국어 산문. */
  body: 17,
  /** 섹션 헤드 · topbar. */
  label: 12,
  /** 장부 키 · 릴리즈 캡션 제목. */
  labelSm: 11,
  /** 캡션 메타. */
  meta: 10,
  /** 작은 캡션 메타(아카이브 타일). */
  metaSm: 9,
} as const

/** 배수. */
export const lineHeight = {
  display: 0.92,
  body: 1.65,
} as const

/** em. mono 는 전 자리에서 같은 트래킹을 쓴다. */
export const letterSpacing = {
  mono: 0.06,
} as const

export const fontWeight = {
  display: 400,
  /** IBM Plex Mono Medium. */
  mono: 500,
  body: 400,
} as const

export type FontFamilyToken = keyof typeof fontFamily
export type FontSizeToken = keyof typeof fontSize
