/** surf-ui 마크 — Surf Blue 알약 위의 물결 하나. 색은 DS 주 색을 그대로 문다. */
export function SurfMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="10" fill="var(--surf-action-primary)" />
      <path
        d="M6 19c3.3 0 3.3-4 6.7-4s3.3 4 6.6 4 3.4-4 6.7-4"
        fill="none"
        stroke="var(--surf-action-on-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 마크 + 소문자 워드마크. 크기는 글자 크기를 따라간다(`em`). */
export function SurfLogo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[0.3em] font-black tracking-tight ${className ?? ''}`}
    >
      <SurfMark className="size-[1em]" />
      surf-ui
    </span>
  )
}
