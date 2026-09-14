/**
 * 간격·치수·선 — 전부 px. 시안이 1440 데스크톱 한 판형이라 반응형 축은 아직 없다.
 *
 * 간격은 두 축으로 갈라 둔다. `gap` 은 **형제 사이**, `pad` 는 **자리의 안쪽 여백**이다.
 * 유틸이 둘을 한 스케일로 받으면 `gap: 'padHeroTop'`(104px 간격) 같은, 시안에 없는
 * 조합이 타입상 유효해진다 — 축을 갈라 두면 조합이 시안 안으로 닫힌다.
 */
export const gap = {
  gap2xs: 6,
  gapXs: 10,
  gapSm: 14,
  gapMd: 22,
  gapLg: 28,
  /** 릴리즈 그리드 열 간격. */
  gridColumn: 32,
  /** 릴리즈 그리드 행 간격(캡션이 붙어 열보다 넓다). */
  gridRow: 40,
} as const

/**
 * `pad*` 는 *자리* 이름이다(hero·section·cell…). 스케일로 뭉개면 시안의 수직 리듬이
 * 살아남지 못한다 — 히어로 104/96 과 섹션 56/72 는 우연히 다른 값이 아니다.
 */
export const pad = {
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

/** 두 축을 합친 전체 간격 스케일. CSS 변수는 `--wbe-spacing-*` 한 묶음으로 발행된다. */
export const spacing = { ...gap, ...pad } as const

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
  /** 빈 슬롯 점선의 칠하는 길이. */
  dash: 6,
  /** 빈 슬롯 점선의 비우는 길이. */
  dashGap: 6,
} as const

/** SVG·CSS `stroke-dasharray` 표기. 값은 `border` 에서 파생한다 — 따로 적지 않는다. */
export const dashArray = `${border.dash} ${border.dashGap}`

export type GapToken = keyof typeof gap
export type PadToken = keyof typeof pad
export type SpacingToken = keyof typeof spacing
export type SizeToken = keyof typeof size
