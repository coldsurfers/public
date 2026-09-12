import { defineConfig } from 'vite'

/**
 * CLI 하나만 굽는다 — **이 패키지의 API 는 모듈이 아니라 실행 파일**이다.
 * `design-system-mcp` 과 같은 자리라서 같은 형태를 쓴다: `exports` 맵도 `.d.ts` 도 내지 않고,
 * 그래서 `check:exports` 도 없다. 열지 않은 만큼 지킬 계약이 없다.
 *
 * 인쇄 CSS 는 번들에 넣지 않고 `dist/css/` 로 그대로 복사된다(다음 스텝). CSS 를 JS 문자열로
 * 굽는 순간 하이라이팅도 포매터도 안 걸리는데, 그게 이 패키지를 만든 이유였다.
 */
export default defineConfig({
  build: {
    lib: { entry: { cli: 'src/cli.ts' }, formats: ['es'] },
    rollupOptions: {
      external: [/^node:/],
      // `bin` 은 셸이 직접 실행한다 — shebang 이 없으면 스크립트로 읽히지 않는다.
      output: { banner: '#!/usr/bin/env node' },
    },
  },
})
