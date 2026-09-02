export const appName = 'COLDSURF Design System'

/**
 * 사이트의 절대 주소 — sitemap 이 `<loc>` 에 쓴다. 상대 경로로는 sitemap 을 쓸 수 없다.
 *
 * 배포 워크플로가 `NEXT_PUBLIC_SITE_URL` 로 넣어준다(리포지터리 변수 `DOCS_SITE_URL`).
 * 안 넣으면 아래 기본값이고, 도메인이 정해지면 **이 한 줄만** 고치면 된다.
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
