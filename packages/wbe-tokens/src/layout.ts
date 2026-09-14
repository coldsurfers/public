/**
 * 간격·치수·선 — 전부 px. 시안이 1440 데스크톱 한 판형이라 반응형 축은 아직 없다.
 *
 * `pad*` 는 *자리* 이름이다(hero·section·cell…). 스케일로 뭉개면 시안의 수직 리듬이
 * 살아남지 못한다 — 히어로 104/96 과 섹션 56/72 는 우연히 다른 값이 아니다.
 */
export const spacing = {
  gap2xs: 6,
  gapXs: 10,
  gapSm: 14,
  gapMd: 22,
  gapLg: 28,
  /** 릴리즈 그리드 열 간격. */
  gridColumn: 32,
  /** 릴리즈 그리드 행 간격(캡션이 붙어 열보다 넓다). */
  gridRow: 40,
  /** 지면 좌우 여백. */
  padPage: 64,
  padBarY: 26,
  padHeroTop: 104,
  padHeroBottom: 96,
  padSectionTop: 56,
  padSectionBottom: 72,
  padCellY: 28,
  padRowY: 20,
} as const

export const size = {
  /** 시안 판형. */
  canvas: 1440,
  /** 릴리즈 타일 한 변. `canvas - padPage×2` 에 4열 + gridColumn 3 이 정확히 들어간다. */
  tile: 304,
  /** 아트워크 아카이브 타일 한 변. */
  tileSm: 192,
} as const

export const border = {
  /** 모든 구분선은 1px 한 종류다. */
  hairline: 1,
  /** 빈 슬롯 테두리. SVG·CSS `stroke-dasharray` 표기. */
  dashArray: '6 6',
} as const

export type SpacingToken = keyof typeof spacing
export type SizeToken = keyof typeof size
