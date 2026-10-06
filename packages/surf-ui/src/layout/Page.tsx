import type { HTMLAttributes } from 'react'
import { cx } from '../primitives'
import { SurfaceModeContext } from '../primitives/surface-mode'
import type { SurfaceMode } from '../tokens/tokens'
import { content, page } from './Page.css'

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 이 페이지의 면 — `ink` · `light` · `auto`. **필수다.** 화면마다 한 번 명시한다.
   * `auto` 는 OS 가 다크면 ink, 아니면 light 다(`prefers-color-scheme`). 토글은 없다.
   *
   * `data-surface` 로 나가 그 안의 색 토큰을 해당 면 값으로 바꾸고(`css/theme.css.ts`), context 로 내려가
   * 포털 오버레이(`Modal` · `Popover`)와 `useSurfaceMode()` 를 읽는 부품이 같은 면을 받는다.
   * ink 면이면 `<body>` 도 ink 스코프를 받는다(`Page.css.ts`) — 짧은 페이지 아래·오버스크롤 바운스 색.
   */
  mode: SurfaceMode
  /**
   * 화면 이름 — `data-page` 로 나가는 앱의 표식이다. DS 는 해석하지 않는다.
   *
   * 쓰임: 소비 앱이 `body:has([data-page="…"])` 로 화면별 바닥색을 덮는다. 그 규칙이 있는 화면에만 준다.
   * 모드와 나눈 이유: 한 속성이 둘을 겸하면 이름을 다는 순간 면 스코프가 꺼진다.
   */
  name?: string
}

/**
 * 표면 레이아웃 루트 — `min-h-100vh` 세로 스택 + 면 모드 + 화면 표식.
 *
 * 상·하단 chrome 은 **슬롯 래퍼 없이 그냥 자식으로 놓는다.** 헤더/푸터의 내용물(라우터·세션·
 * i18n·계측)은 앱의 것이고, DS 가 그 자리에 `<div>` 한 겹을 더 두면 아무것도 안 하는 이름이
 * 공개 계약에 오른다(#19 D-2 · seed-design `AppScreen` 이 `AppBar` 를 자식으로 두는 것과 같다).
 *
 * ```tsx
 * <Page mode="ink" name="event-detail">
 *   <SiteHeader />
 *   <Page.Content>…</Page.Content>
 *   <SiteFooter />
 * </Page>
 * ```
 *
 * 면 값은 DS 가 들고, 그 위 배경·글자색 칠하기는 앱이 `className` 으로 준다 — 표면 정책은 값이 아니라
 * 제품 결정이라 계약에 박지 않는다(`docs/p1-boundary.md` 결정 3).
 */
function PageRoot({ mode, name, className, children, ...rest }: PageProps) {
  return (
    <SurfaceModeContext.Provider value={mode}>
      <div data-surface={mode} data-page={name} className={cx(page, className)} {...rest}>
        {children}
      </div>
    </SurfaceModeContext.Provider>
  )
}

/** 헤더·푸터 사이의 `<main>`. 남은 높이를 먹어 푸터를 바닥으로 민다. */
function PageContent({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <main className={cx(content, className)} {...rest} />
}

export const Page = Object.assign(PageRoot, { Content: PageContent })
