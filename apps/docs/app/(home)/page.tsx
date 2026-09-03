import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-fd-muted-foreground">
        coldsurfers/public
      </p>
      <h1 className="vt-brand text-4xl font-semibold tracking-tight">COLDSURF Design System</h1>
      <p className="text-fd-muted-foreground">
        import 두 줄이면 COLDSURF 의 색 · 타이포 · 컴포넌트가 그대로 붙습니다. 토큰부터 React
        컴포넌트까지 한 패키지에 있고, 번들러 설정은 따로 없습니다.
      </p>
      <p className="text-fd-muted-foreground">
        범용 UI 킷은 아닙니다 — COLDSURF 서비스에 맞춘 기본값(accent · paper · cover 톤)이 처음부터
        들어 있습니다. 그 결이 맞으면 그대로 쓰고, 아니면 토큰만 갈아끼웁니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/docs"
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
        >
          문서 열기
        </Link>
        <Link
          href="/docs/components/button"
          className="rounded-lg border border-fd-border px-4 py-2 text-sm font-medium"
        >
          컴포넌트 보기
        </Link>
      </div>
    </main>
  )
}
