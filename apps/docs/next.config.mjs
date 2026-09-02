import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/**
 * 정적 내보내기 — 서버 런타임을 지지 않는다.
 *
 * 검색은 Fumadocs 가 인덱스를 파일로 굽고 브라우저에서 계산한다(`orama-static`).
 * 그래서 `out/` 을 그대로 Cloudflare Workers static assets 로 올린다 — OpenNext 불필요.
 *
 * `trailingSlash: true` 인 이유: 정적 호스팅에서 `/docs/button` 을
 * `/docs/button/index.html` 로 떨어뜨려야 디렉터리 인덱스로 열린다.
 *
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
}

export default withMDX(config)
