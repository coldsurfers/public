'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

/** 끝의 `/` 를 지운다 — `trailingSlash: true` 라 같은 경로가 두 꼴로 들어온다. */
function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '')
}

/**
 * 라우트 전환에 View Transition 을 건다.
 *
 * App Router 의 이동은 SPA 라 CSS `@view-transition { navigation: auto }` 가 안 걸린다.
 * 그래서 문서 전체의 클릭을 **캡처 단계에서 한 번** 가로채 `startViewTransition` 안에서
 * `router.push` 를 돌린다 — 홈 CTA 든 Fumadocs 사이드바든 링크마다 감쌀 필요가 없다.
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
      // 라우트가 안 바뀌는 이동 — TOC 의 해시 링크가 여기로 빠진다.
      if (normalizePath(url.pathname) === normalizePath(window.location.pathname)) return

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
