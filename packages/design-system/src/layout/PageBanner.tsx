import type { HTMLAttributes } from 'react'
import { cx } from '../primitives'
import { Container } from './Container'
import { banner, bannerBody, bannerShell, bannerTitle } from './PageBanner.css'

/**
 * 다크 풀블리드 밴드 — 지면을 다 읽은 자리에서 색이 뒤집혀 "본문이 끝났고 여기부터는 요구"
 * 라는 걸 글자 없이 알린다. 근거·결정 로그: coldsurfers/public#33
 *
 * **레이아웃은 소비처의 것이다.** DS 가 드는 건 바닥·셸·타이포 셋뿐이고 그 안의 배치는
 * `children` 이 정한다. `align` 축을 열지 않은 이유는 실측이다 — 소비처 둘의 정렬이 서로
 * 다르지만 각 정렬의 **실사용이 1곳씩**이라 추출할 중복이 없었다(#33 결정 1). `Modal` 이
 * `placement` 를 연 건 5 소비처 중 4곳이 같은 두 줄을 복붙하고 있었기 때문이고, 여기는
 * 그 조건이 성립하지 않는다. 세 번째 밴드가 같은 정렬을 복붙하면 그때 minor 로 연다.
 *
 * ```tsx
 * <PageBanner>
 *   <div className={sprinkles({ display: 'flex', justifyContent: { tablet: 'space-between' } })}>
 *     <div>
 *       <PageBanner.Title>새 공연 뜨면 알려드릴게요</PageBanner.Title>
 *       <PageBanner.Body>스팸 없이.</PageBanner.Body>
 *     </div>
 *     {actions}
 *   </div>
 * </PageBanner>
 * ```
 */
function PageBannerRoot({ className, children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cx(banner, className)} {...rest}>
      <Container className={bannerShell}>{children}</Container>
    </section>
  )
}

/**
 * 밴드 제목. `<h2>` 인 이유는 밴드가 지면 본문 다음에 서는 한 덩이라서다 — 문서 제목(`<h1>`)
 * 아래 형제가 맞다. 다른 레벨이 필요하면 소비처가 `as` 없이 감싸지 말고 이슈를 연다.
 */
function PageBannerTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx(bannerTitle, className)} {...rest} />
}

/** 제목 아래 한두 줄. 제목과의 간격은 **소비처가 준다** — 둘이 항상 붙어 서는 게 아니다. */
function PageBannerBody({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx(bannerBody, className)} {...rest} />
}

/**
 * eyebrow 슬롯이 없는 이유: 소비처 둘 중 **한 곳만** 쓴다(`SigninBand` 의 `COLDSURF · 관심 목록`).
 * 게다가 그건 mono·uppercase 가 아니라 `Eyebrow` primitive 와도 다른 결이다. 두 번째 소비처가
 * 생길 때까지 앱에 둔다 — `PageBanner` 의 자식으로 그냥 놓으면 된다.
 */
export const PageBanner = Object.assign(PageBannerRoot, {
  Title: PageBannerTitle,
  Body: PageBannerBody,
})
