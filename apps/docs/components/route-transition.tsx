'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

/** 끝의 `/` 를 지운다 — `trailingSlash: true` 라 같은 경로가 두 꼴로 들어온다. */
function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '')
}

/** 랜딩인가. 브랜드가 `<h1>` 로 크게 서 있는 유일한 페이지다. */
function isHome(pathname: string) {
  return normalizePath(pathname) === ''
}

/**
 * 라우트 전환에 View Transition 을 건다.
 *
 * App Router 의 이동은 SPA 라 CSS `@view-transition { navigation: auto }` 가 안 걸린다.
 * 그래서 문서 전체의 클릭을 **캡처 단계에서 한 번** 가로채 `startViewTransition` 안에서
 * `router.push` 를 돌린다 — 홈 CTA 든 Fumadocs 사이드바든 링크마다 감쌀 필요가 없다.
 *
 * 다만 여는 건 **홈 ↔ 문서** 뿐이다. 브랜드가 자리를 옮기는 이동이 그것뿐이라, 나머지에선
 * 크로스페이드만 남아 이동이 느려진다.
 *
 * `preventDefault` 만 하고 전파는 막지 않는다. Next 의 `Link` 는 `defaultPrevented` 를 보고
 * 스스로 빠지므로(`next/dist/client/app-dir/link.js`), 사이드바 닫기 같은 부수 핸들러는 그대로 돈다.
 *
 * 미지원 브라우저와 `prefers-reduced-motion: reduce` 에선 아무것도 가로채지 않는다 —
 * 기본 동작이 그대로 남으므로 fallback 코드가 따로 없다.
 */
export function RouteTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const finish = useRef<(() => void) | null>(null)

  // 두 번째 스냅샷은 새 화면이 그려진 뒤에 찍혀야 한다. App Router 의 transition 이
  // 끝나는 시점이 그 자리다 — 그때 `startViewTransition` 의 promise 를 푼다.
  useEffect(() => {
    if (isPending) return
    finish.current?.()
    finish.current = null
  }, [isPending])

  useEffect(() => {
    if (!('startViewTransition' in document)) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (reduced.matches) return

      const target = event.target instanceof Element ? event.target : null
      const anchor = target?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      // 브랜드가 실제로 자리를 옮기는 이동에서만 연다 — 홈 ↔ 문서가 그 하나다.
      //
      // 문서 → 문서는 타이틀이 사이드바에 그대로 있어 morph 가 없고, 본문 크로스페이드만
      // 남아 이동이 그만큼 늦어진다. 얻는 것 없이 무는 비용이라 여기서 뺀다.
      // 같은 경로(TOC 해시)도 양쪽이 같은 판정을 받아 함께 빠진다.
      if (isHome(url.pathname) === isHome(window.location.pathname)) return

      event.preventDefault()
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finish.current = resolve
            startTransition(() => {
              router.push(`${url.pathname}${url.search}${url.hash}`)
            })
          }),
      )
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [router])

  return null
}
