import type { ReactNode } from 'react'

/**
 * 시안 실험실 — 문서 크롬(사이드바 · 검색 · TOC)이 없는 자리.
 *
 * `apps/docs` 안에 두는 이유는 하나다. 여기서 import 하는 `@coldsurfers/design-system` 이
 * 소스가 아니라 **발행되는 `dist`** 라서, 시안이 그려진다는 것 자체가 "이 조합이 실제 소비처에서
 * 된다" 는 증거가 된다. 별도 앱을 파면 그 증거가 사라진다.
 *
 * 그리고 `output: 'export'` 라 빌드하면 그대로 URL 이 된다 — 시안을 공유하는 데 서버가 필요 없다.
 */
export default function PlaygroundLayout({ children }: { children: ReactNode }) {
  return <div className="ds-surface flex min-h-screen flex-col">{children}</div>
}
