import type { ReactNode } from 'react'
import { Provider } from '@/components/provider'
import './global.css'
// DS 는 tailwind·fumadocs preset **뒤에** 온다 — `LAYER_ORDER` 가 `base` 를 `ds-components`
// 앞에 두므로 preflight 가 컴포넌트를 지우지 않는다. 순서가 뒤집히면 그 보장이 깨진다.
import '@coldsurfers/design-system/styles.css'
// 그리고 마지막에 문서 크롬을 되돌린다. 이유는 파일 주석.
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
