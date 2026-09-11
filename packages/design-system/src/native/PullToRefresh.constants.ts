/**
 * `PullToRefresh` 의 튜닝 값. 왜 이 숫자인가가 여기 한 곳에만 적혀 있어야 만질 때 한 파일만 연다.
 *
 * **`contract/` 가 아니다.** 웹 짝이 없어 갈릴 상대가 없기 때문이다 —
 * `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」.
 */

/** 이만큼 당겨서 놓아야 새로고침이 걸린다. 이 거리에서 인디케이터가 완전히 진해진다. */
export const PULL_THRESHOLD = 72

/** 새로고침 중 스크롤 위에 열어두는 틈 — 인디케이터가 온전히 서는 높이. */
export const REFRESHING_GAP = 32

/** 손가락을 더 끌어도 여기까지만 늘어난다 — 고무줄 끝. */
export const MAX_PULL = 120

/** 손가락 이동 대비 실제로 열리는 비율. 1 이면 손가락에 붙어 뻣뻣하고, 낮을수록 당기는 맛이 난다. */
export const PULL_RESISTANCE = 0.55

/**
 * 최소 노출 시간. 캐시가 더워 50ms 만에 끝나면 인디케이터가 깜빡이고 마는데,
 * 사용자 눈엔 "안 됐다"로 읽힌다.
 */
export const MIN_VISIBLE_MS = 450

/** 세로 이 정도는 움직여야 당김으로 친다. 탭·짧은 튕김을 당김으로 오인하지 않게 하는 하한. */
export const ACTIVATE_OFFSET_Y = 12

/** 가로로 이만큼 흐르면 당김을 포기한다 — 가로 레일 스와이프를 뺏지 않기 위해. */
export const FAIL_OFFSET_X = 20

/** 인디케이터 지름. */
export const SPINNER_SIZE = 26
export const SPINNER_STROKE_WIDTH = 2.5
export const SPINNER_RADIUS = (SPINNER_SIZE - SPINNER_STROKE_WIDTH) / 2
export const SPINNER_CIRCUMFERENCE = 2 * Math.PI * SPINNER_RADIUS
/** 원의 135° 만 그린다 — 도는 게 보이려면 끊긴 데가 있어야 한다. */
export const SPINNER_ARC = SPINNER_CIRCUMFERENCE * (135 / 360)
export const SPIN_DURATION_MS = 900
