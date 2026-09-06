import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — **소스가 아니라 `dist` 를 발행한다.**
 *
 * 소스를 그대로 내보내면 소비자마다 TS·JSX 를 `node_modules` 까지 처리하도록 열어야 한다.
 * 공개 패키지에서 그건 계약이 아니라 부탁이다(AGENTS.md). RN 축도 막지 않는다 —
 * metro 0.87 은 `unstable_enablePackageExports` 가 기본 on 이라 `exports` 맵과 `dist` 를 읽는다.
 *
 * 진입점은 **의존성 경계**로 가른다:
 *   `.`         openapi-fetch 만. 타입 하나 쓰는 소비자가 UI 런타임을 지지 않는다
 *   `./react`   react · @tanstack/react-query
 *   `./queries` 위 + 도메인 훅
 *   `./client`  웹 auth 미들웨어 (openapi-fetch 만)
 *
 * `rollupTypes: true` — 엔트리당 d.ts 한 장으로 만다. 소스 트리를 그대로 내보내면
 * `from './error'` 같은 확장자 없는 상대 경로가 남는데 `moduleResolution: nodenext`
 * 소비처는 그걸 못 연다(우리 빌드·타입체크는 통과한다). 게이트는 `check:exports`.
 */
export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        react: 'src/react/index.ts',
        queries: 'src/queries/index.ts',
        client: 'src/client/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        '@tanstack/react-query',
        '@tanstack/query-core',
        'openapi-fetch',
      ],
    },
  },
})
