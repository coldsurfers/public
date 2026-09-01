import type { HTMLAttributes } from 'react'
import { cx } from '../primitives'
import { content, page } from './Page.css'

export interface PageProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `data-surface` 마커로 그대로 나간다. **DS 는 이 값을 해석하지 않는다** — 해석하는 순간
   * 표면 목록이 공개 API 가 된다.
   *
   * 쓰임: `<body>` 는 React 트리 밖이라 컴포넌트가 스타일을 못 준다. 소비 앱이
   * `body:has([data-surface="…"]) { background: … }` 로 위로 올려쳐서 콘텐츠 밖(짧은 페이지
   * 아래·오버스크롤 바운스) 색이 표면과 어긋나는 걸 막는다.
   *
   * **optional 이다.** 그 규칙이 있는 표면에만 준다 — 없는데 붙이면 아무 일도 안 하는 문자열을
   * 표면마다 지어내게 된다(coldsurfers/public#19 D-6).
   */
  surface?: string
}

/**
 * 표면 레이아웃 루트 — `min-h-100vh` 세로 스택 + `data-surface` 마커 + 표면 스타일 주입구.
 *
 * 상·하단 chrome 은 **슬롯 래퍼 없이 그냥 자식으로 놓는다.** 헤더/푸터의 내용물(라우터·세션·
 * i18n·계측)은 앱의 것이고, DS 가 그 자리에 `<div>` 한 겹을 더 두면 아무것도 안 하는 이름이
 * 공개 계약에 오른다(#19 D-2 · seed-design `AppScreen` 이 `AppBar` 를 자식으로 두는 것과 같다).
 *
 * ```tsx
 * <Page surface="tonight" style={WARM_PAPER_SURFACE}>
 *   <SiteHeader />
 *   <Page.Content>…</Page.Content>
 *   <SiteFooter />
 * </Page>
 * ```
 *
 * 표면 팔레트(warm-paper 라이트 고정 등)는 `style` 로 앱이 주입한다 — 표면 정책은 값이 아니라
 * 제품 결정이라 계약에 박지 않는다(`docs/p1-boundary.md` 결정 3).
 */
function PageRoot({ surface, className, children, ...rest }: PageProps) {
  return (
    <div data-surface={surface} className={cx(page, className)} {...rest}>
      {children}
    </div>
  )
}

/** 헤더·푸터 사이의 `<main>`. 남은 높이를 먹어 푸터를 바닥으로 민다. */
function PageContent({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <main className={cx(content, className)} {...rest} />
}

export const Page = Object.assign(PageRoot, { Content: PageContent })
