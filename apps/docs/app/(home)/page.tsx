import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.26em] text-fd-muted-foreground">
        coldsurfers/public
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">COLDSURF Design System</h1>
      <p className="text-fd-muted-foreground">
        토큰 값 · CSS 계약(vanilla-extract) · React primitives. 범용 라이브러리가 아니라 COLDSURF
        서비스에 정합된 디자인 시스템이다 — 브랜드 값이 기본값으로 딸려온다.
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
