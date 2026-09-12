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
 * ⚠️ **아래 `turbopack` 블록은 turbopack 으로 빌드할 때만 읽힌다.** Next 16 은 `next dev` ·
 * `next build` 둘 다 turbopack 이 기본이라 지금은 맞지만, 누가 `--webpack` 을 붙이는 순간
 * 별칭 둘이 통째로 무시되고 RN 본체(Flow 소스)가 번들에 들어와 파싱에서 깨진다.
 * webpack 으로 가야 한다면 `webpack: (config) => ...` 안에 `resolve.alias` 로 같은 둘을
 * 다시 적어야 한다 — `resolveAlias` 는 `TurbopackOptions` 안에만 있는 옵션이다.
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
      /**
       * safe-area-context 는 **웹 판을 골라 주지 않으면 안 선다.** 내부에서
       * `./NativeSafeAreaProvider` 를 상대 경로로 여는데, 그 `.js` 판이 `react-native` 의
       * 깊은 경로(`Libraries/Utilities/codegenNativeComponent`)를 문다. 위 별칭은 맨 이름에만
       * 걸리므로 깊은 경로는 RN 본체로 풀리고, 그건 Flow 소스라 파싱조차 안 된다.
       *
       * 패키지 안에 `.web.js` 판이 이미 있지만 turbopack 은 node_modules 에서 확장자 우선순위
       * (`resolveExtensions`)를 적용하지 않는다 — 실측으로 확인했다.
       *
       * 그래서 문서 사이트에서만 얇은 shim 으로 바꾼다. 브라우저에는 안전 영역이 없어
       * 인셋이 전부 0 이고, 실제 웹 판도 측정 전까지 같은 값을 준다 — 미리보기 판정이
       * 달라지지 않는다. 자세한 경계는 `shims/safe-area-context.tsx`.
       */
      'react-native-safe-area-context': './shims/safe-area-context.tsx',
    },
  },
}

export default withMDX(config)
