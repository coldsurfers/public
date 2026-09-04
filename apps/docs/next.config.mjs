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
 * `react-native` → `react-native-web` 별칭은 **시안(`/playground`) 전용 배선**이다.
 * DS 의 `./native` 레인은 `@emotion/native` 와 `react-native` 를 무는데, 그 둘은
 * 브라우저에서 그대로 못 돈다(RN 본체는 Flow 소스라 번들러가 파싱조차 못 한다).
 * 별칭을 걸면 같은 import 가 `react-native-web` 의 DOM 구현으로 풀려서, **RN 용으로 쓴
 * 컴포넌트를 고치지 않고** 문서 사이트에서 그려볼 수 있다.
 *
 * 발행물엔 영향이 없다 — `apps/docs` 는 `private` 이고, 이 별칭은 이 앱의 번들에만 걸린다.
 *
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
  },
}

export default withMDX(config)
