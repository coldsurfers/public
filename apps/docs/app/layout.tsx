import type { ReactNode } from 'react'
import { Provider } from '@/components/provider'
import './global.css'
// DS CSS 는 여기서 물지 않는다 — DS 진입점이 `styles.css` 를 직접 물고 온다. 그래서 실리는
// 자리는 이 파일이 아니라 컴포넌트를 처음 import 하는 청크고, tailwind 와의 앞뒤도 그때 정해진다.
// 순서 보장은 `LAYER_ORDER` 가 진다 — `base`(preflight)가 `ds-components` 앞이라 어느 쪽이
// 먼저 실려도 preflight 가 컴포넌트를 지우지 않는다.
// 그리고 문서 크롬을 되돌린다. **레이어 밖 규칙**이라 순서와 무관하게 `ds-reset` 을 이긴다.
import './ds-bridge.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
