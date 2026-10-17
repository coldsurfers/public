import { BOARDS, type BoardKey, type Pin, toBoard } from '@/lib/pins'
import { siteUrl } from '@/lib/shared'
import { source } from '@/lib/source'
import { AgentStart } from './agent-start'
import { HeroActions } from './hero-actions'
import { PinBoard } from './pin-board'

const prompt = `${siteUrl}/llms.txt 를 읽고 UI 는 @coldsurfers/surf-ui 로 짜줘. 컴포넌트를 쓰기 전에 그 페이지의 .txt 에서 props 와 예제를 확인해.`
const mcpCommand = 'claude mcp add coldsurf-ds -- npx -y @coldsurfers/design-system-mcp'

export default function HomePage() {
  return (
    <main className="ds-surface flex-1">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pt-16 pb-24">
        <header className="flex max-w-xl flex-col gap-4">
          <p className="text-xs font-semibold text-(--surf-kicker)">surf-ui · 시안 v3</p>
          <h1 className="vt-brand text-4xl leading-tight font-bold tracking-tight">
            COLDSURF 의 면을
            <br />
            import 두 줄로
          </h1>
          <p className="text-(--surf-text-secondary)">
            토큰 · 컴파일된 CSS · React 컴포넌트가 한 패키지에 있습니다. 번들러 설정은 없고, 문서의
            모든 페이지는 에이전트가 읽는 평문 사본을 함께 굽습니다.
          </p>
          <HeroActions />
        </header>
        <AgentStart prompt={prompt} mcpCommand={mcpCommand} />
        <PinBoard pins={getPins()} />
      </div>
    </main>
  )
}

/** 문서 페이지 하나가 핀 한 장 — 목록을 옮겨 적지 않고 `source` 에서 뽑는다. */
function getPins(): Pin[] {
  const order = Object.keys(BOARDS) as BoardKey[]

  return source
    .getPages()
    .flatMap((page) => {
      const board = toBoard(page.path)
      if (!board) return []

      return [{ href: page.url, title: page.data.title, meta: page.data.description ?? '', board }]
    })
    .sort((a, b) => order.indexOf(a.board) - order.indexOf(b.board))
}
