/**
 * `Spinner` 의 계약. 규율은 `./index.ts`.
 *
 * **prop 인터페이스는 올리지 않는다** — 웹은 `className` 을 받고 native 는 받을 자리가 없다.
 * 여기 있는 건 두 구현이 **같은 링을 그리려면 같아야 하는 숫자**뿐이다.
 *
 * 값을 묶는 이유는 이미 갈려 있었기 때문이다. native 가 플랫폼 인디케이터를 쓰던 동안
 * 라벨만 각자 적혔고 — 웹 13, native `sm`(14) — 의도인지 사고인지 코드로 구분되지 않았다.
 *
 * ⚠️ 색은 여기 없다. 양쪽이 자기 토큰 맵(`vars.color` ↔ `scheme`)에서 읽는다 — `tokens/` 가 정본.
 */

export const SPINNER_SPEC = {
  /** 지름(px) 기본값 — Figma Playground Dev-CM `LoadingSpinner · 무한스크롤`(341:2). */
  size: 30,
  strokeWidth: 3,
  /** 원의 270° 만 그린다 — 나머지 90° 가 비어 있어야 도는 게 보인다. */
  arcSweep: 0.75,
  /** 스피너 ↔ 라벨. */
  gap: 14,
  /**
   * `fontSize` 스케일 밖 리터럴이다 — `xs`(12) 와 `sm`(14) 사이에 있다. 로더 아래 한 줄을
   * 위해 스케일을 늘리지 않는다(`ConcertCard` 제목의 `700` 과 같은 예외).
   */
  labelFontSize: 13,
  /** 한 바퀴. 웹 `animationDuration: '1s'`. */
  spinDurationMs: 1000,
  /**
   * `label` 이 없을 때 쓰는 접근성 이름. **보이는 문구가 아니다** — 웹은 `srOnly`,
   * native 는 `accessibilityLabel` 로만 나간다.
   *
   * 스피너는 라벨 없이 쓰는 게 기본값(Figma `라벨 표시` off)이라, 이름이 없으면 그냥
   * 이름 없는 `progressbar` 가 된다. 웹은 이미 이 폴백을 들고 있었고 native 만 빠져 있어서
   * **같은 컴포넌트의 접근성 수준이 플랫폼마다 달랐다.** 두 레인이 같은 문구를 말해야 하므로
   * 리터럴을 양쪽에 적지 않고 여기 둔다.
   */
  fallbackLabel: '불러오는 중',
} as const

/**
 * 아크 링의 기하. `strokeDasharray` 가 양쪽에서 **같은 세 숫자**를 받아야 같은 링이 된다 —
 * 두 파일에서 따로 계산하면 한쪽 반올림만 바뀌어도 아무도 못 잡는다.
 */
export function getSpinnerGeometry(size: number) {
  const radius = (size - SPINNER_SPEC.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  return { radius, circumference, arc: circumference * SPINNER_SPEC.arcSweep }
}
