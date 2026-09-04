import Link from 'next/link'

/**
 * 시안 목록. 실험이 늘면 여기에 줄이 는다.
 *
 * 시안을 레포 안에 두는 이유는 [`layout.tsx`](./layout.tsx) 주석에 있다 — 요약하면
 * **진짜 DS 컴포넌트로 그리므로 일관성이 약속이 아니라 사실**이 된다.
 */
const SCREENS = [
  {
    href: '/playground/coldsurf-mobile',
    title: 'billets 피드 화면',
    description:
      'billets-app 이 처음 여는 4탭 피드를 리스킨. 컬렉션 5개가 가로 레일로 서고, 카드는 진짜 ConcertCard 다.',
  },
]

export default function PlaygroundIndex() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="font-semibold text-2xl">Playground</h1>
      <p className="mt-2 text-fd-muted-foreground text-sm">
        발행되는 <code>dist</code> 를 물고 그린 시안들. 그려진다는 것 자체가 그 조합이 실제
        소비처에서 된다는 증거다.
      </p>

      <ul className="mt-8 flex flex-col gap-3">
        {SCREENS.map((screen) => (
          <li key={screen.href}>
            <Link
              href={screen.href}
              className="block rounded-xl border border-fd-border p-4 transition-colors hover:bg-fd-accent"
            >
              <span className="font-medium">{screen.title}</span>
              <span className="mt-1 block text-fd-muted-foreground text-sm">
                {screen.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
