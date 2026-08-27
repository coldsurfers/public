import { cx } from './cx'
import {
  spinnerArc,
  spinnerLabel,
  spinnerRoot,
  spinnerSvg,
  spinnerTrack,
  srOnly,
} from './Spinner.css'

/**
 * Loading Spinner — Figma Playground Dev-CM `LoadingSpinner · 무한스크롤`(341:2).
 * light 트랙 링 + blood-orange(`accent`) 270° 아크가 도는 로더. 무한스크롤 푸터가 홈.
 *
 * Figma 컴포넌트 프로퍼티 대응:
 *   `라벨 표시`(BOOLEAN) → `label` 유무. 없으면(기본) 스피너만 = off 상태.
 *   `문구`(TEXT)         → `label` 값.
 */
export type SpinnerProps = {
  /** 지름(px). 기본 30 — Figma 로더 값. */
  size?: number
  /** 있으면 스피너 아래 muted 라벨을 렌더. 없으면(기본) 스피너만(Figma `라벨 표시` off). */
  label?: string
  className?: string
}

const STROKE = 3

export function Spinner({ size = 30, label, className }: SpinnerProps) {
  const r = (size - STROKE) / 2
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75 // 270° sweep — Figma arcData

  return (
    <div role="status" className={cx(spinnerRoot, className)}>
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: 장식용 — 접근성 이름은 role="status" 컨테이너가 가짐 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden
        className={spinnerSvg}
      >
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={STROKE} className={spinnerTrack} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}
          className={spinnerArc}
        />
      </svg>
      {label ? (
        <span className={spinnerLabel}>{label}</span>
      ) : (
        <span className={srOnly}>불러오는 중</span>
      )}
    </div>
  )
}
