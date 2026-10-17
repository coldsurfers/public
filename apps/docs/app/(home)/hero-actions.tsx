'use client'
import { Button } from '@coldsurfers/surf-ui/primitives'
import Link from 'next/link'

/** `primitives` 배럴에 `'use client'` 가 없어 서버 컴포넌트인 홈이 직접 못 연다 — 경계를 여기서 긋는다. */
export function HeroActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="lg" shape="pill">
        <Link href="/docs">문서 열기</Link>
      </Button>
      <Button asChild size="lg" shape="pill" variant="secondary">
        <a href="/llms.txt">llms.txt</a>
      </Button>
    </div>
  )
}
