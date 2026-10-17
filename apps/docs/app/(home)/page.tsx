import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SurfLogo } from '@/components/surf-logo'
import { siteUrl } from '@/lib/shared'
import { source } from '@/lib/source'
import { AgentSteps } from './agent-steps'
import { HeroCollage, TeamCollage } from './collage'

const prompt = `${siteUrl}/llms.txt 를 읽고 UI 는 @coldsurfers/surf-ui 로 짜줘. 컴포넌트를 쓰기 전에 그 페이지의 .txt 에서 props 와 예제를 확인해.`
const mcpCommand = 'claude mcp add coldsurf-ds -- npx -y @coldsurfers/design-system-mcp'

/** 입구 카드 셋. 주소는 슬러그로 적고 빌드 때 `source` 에서 찾는다 — 페이지가 옮겨지면 빌드가 깨진다. */
const ENTRIES = [
  {
    slugs: [],
    title: '시작하기',
    body: '설치 · 진입점 · import 두 줄. 번들러 설정 없이 붙는 이유까지.',
  },
  {
    slugs: ['foundations', 'colors'],
    title: 'Foundations',
    body: '색 · 타이포 · 여백 · 레이어. 화면을 짓는 토큰과 그 규칙.',
  },
  {
    slugs: ['components', 'button'],
    title: 'Components',
    body: '버튼 · 칩 · 시트 · 핀 카드. 발행본을 그대로 그린 미리보기와 props.',
  },
]

export default function HomePage() {
  const entries = ENTRIES.map((entry) => {
    const page = source.getPage(entry.slugs)
    if (!page) throw new Error(`입구 카드의 /${entry.slugs.join('/')} 페이지가 없다`)

    return { ...entry, href: page.url }
  })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 break-keep flex-col gap-24 px-5 pt-10 pb-28">
      <HeroCollage>
        <p className="text-sm font-bold text-(--surf-kicker)">COLDSURF Design System</p>
        <h1 className="text-7xl leading-none sm:text-8xl">
          <SurfLogo />
        </h1>
        <p className="text-(--surf-text-secondary)">
          가고 싶은 곳을 핀으로 모으는 화면을, 같은 토큰과 같은 컴포넌트로 짓습니다.
        </p>
      </HeroCollage>

      <nav aria-label="문서 입구" className="grid gap-4 sm:grid-cols-3">
        {entries.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="group flex flex-col gap-2 rounded-(--surf-radius-panel) bg-(--surf-bg-alt) p-5 transition-colors hover:bg-(--surf-line-divider)"
          >
            <span className="flex items-center justify-between text-lg font-bold">
              {entry.title}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="text-sm leading-relaxed text-(--surf-text-secondary)">
              {entry.body}
            </span>
          </Link>
        ))}
      </nav>

      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl leading-tight font-bold tracking-tight">
            surf-ui 는 COLDSURF 를
            <br />
            만드는 모두를 위해
          </h2>
          <p className="leading-relaxed text-(--surf-text-secondary)">
            디자이너와 엔지니어, 그리고 에이전트까지. 같은 토큰을 쓰고 같은 평문 사본을 읽어서 웹과
            앱이 같은 화면으로 섭니다. 문서의 미리보기는 그림이 아니라 발행된 패키지를 그대로 그린
            것입니다.
          </p>
        </div>
        <TeamCollage />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl leading-tight font-bold tracking-tight">에이전트로 쓰기</h2>
          <p className="text-(--surf-text-secondary)">
            모든 페이지가 예제 · props · 토큰 값이 든 평문 사본을 함께 굽습니다.{' '}
            <Link href="/docs/mcp" className="font-medium text-(--surf-kicker)">
              자세히 →
            </Link>
          </p>
        </div>
        <AgentSteps prompt={prompt} mcpCommand={mcpCommand} />
      </section>
    </main>
  )
}
