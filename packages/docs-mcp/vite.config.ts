import { defineConfig } from 'vite'

/**
 * CLI 하나만 굽는다 — **이 패키지의 API 는 모듈이 아니라 실행 파일**이다.
 *
 * 그래서 `exports` 맵도 `.d.ts` 도 내지 않는다. 다른 두 패키지와 달리 소비자가 여기서
 * import 할 게 없으니, 열지 않은 만큼 지킬 계약도 없다.
 *
 * 의존은 번들에 넣지 않는다(`external`). MCP SDK 와 zod 는 소비자가 `npx` 로 설치할 때
 * 같이 내려오고, 굳이 사본을 하나 더 만들 이유가 없다.
 */
export default defineConfig({
  build: {
    lib: { entry: { stdio: 'src/stdio.ts' }, formats: ['es'] },
    rollupOptions: {
      external: [/^@modelcontextprotocol\//, 'zod', /^node:/],
      // `bin` 은 셸이 직접 실행한다 — shebang 이 없으면 스크립트로 읽히지 않는다.
      output: { banner: '#!/usr/bin/env node' },
    },
  },
})
