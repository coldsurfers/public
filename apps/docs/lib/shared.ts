export const appName = 'COLDSURF Design System'

/**
 * 사이트의 절대 주소 — sitemap 이 `<loc>` 에 쓴다. 상대 경로로는 sitemap 을 쓸 수 없다.
 *
 * `wrangler.jsonc` 의 `routes` 와 **같은 주소여야 한다.** 한쪽만 바꾸면 배포는 성공하고
 * sitemap 만 조용히 다른 도메인을 가리킨다 — 타입도 빌드도 이걸 못 잡는다.
 *
 * 리포지터리 변수 `DOCS_SITE_URL` 로 덮을 수 있다(워크플로가 `NEXT_PUBLIC_SITE_URL` 로 넘긴다).
 * 미리보기 배포처럼 도메인이 다를 때 쓰는 자리고, 평시엔 아래 기본값이다.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://design.coldsurf.io').replace(
  /\/$/,
  '',
)
export const docsRoute = '/docs'
/** 페이지별 평문 사본이 사는 접두. `/llms/components/badge.txt` 꼴. */
export const docsContentRoute = '/llms'

export const gitConfig = {
  user: 'coldsurfers',
  repo: 'public',
  branch: 'main',
  /** 문서 소스가 사는 곳 — `page.path` 앞에 붙는다. */
  contentDir: 'apps/docs/content/docs',
}
