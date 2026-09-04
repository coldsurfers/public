import type { ReactNode } from 'react'
import { Provider } from '@/components/provider'
import { RouteTransition } from '@/components/route-transition'
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
      <head>
        {/*
         * Pretendard — **토큰이 이름만 부르던 폰트를 여기서 실제로 싣는다.**
         *
         * 안 실으면 `--font-family-sans` 의 1·2순위가 둘 다 미스하고 `-apple-system` 으로
         * 떨어진다. 개발기에 정적 Pretendard 가 깔려 있으면 2순위(`Pretendard`)가 걸려
         * 로컬에서만 맞게 보이는데, 배포된 사이트에선 재현되지 않는다 — 가장 나쁜 종류의 차이다.
         *
         * ⚠️ 이름이 **`Pretendard Variable`** 이어야 한다. 웹 레인은 fallback 스택이 있어
         * 정적 `Pretendard` 로도 걸리지만, native 레인(`design-system/native`)은 RN 규약상
         * 폰트 이름을 **하나만** 쓴다(`tokens/native.ts` 의 `nativeFontFamily.sans`).
         * 가변으로 등록해야 `/playground/coldsurf-mobile` 시안이 같은 서체로 서고,
         * `fontWeight` 축(300~600)도 그때 처음 실제로 먹는다.
         *
         * dynamic subset 인 이유: 한글 전체 가변 폰트는 2.0 MB 한 덩어리인데, 이 CSS 는
         * `unicode-range` 로 300여 조각을 선언해 브라우저가 **쓰인 글자에 해당하는 조각만**
         * 받는다(실측 ~70 KB). 자체 호스팅하면 그 300개가 레포에 쌓이므로 CDN 을 문다 —
         * 죽으면 조용히 시스템 폰트로 떨어질 뿐이라 실패가 안전한 쪽이다.
         *
         * 버전을 태그로 고정한다(`@v1.3.9`). 안 고정하면 서체가 조용히 바뀐다.
         */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        <RouteTransition />
      </body>
    </html>
  )
}
