import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — **소스가 아니라 `dist` 를 발행한다.**
 *
 * 진입점은 **실행 환경**으로 가른다. 배럴 하나로 묶으면 RN 앱이 esbuild 를 물게 된다:
 *   `.`         호스트(RN)에서 도는 런타임 — shared scope 등록·원격 회수
 *   `./esbuild` 빌드 머신(Node)에서 도는 번들러 플러그인
 *   `./cli`     bin. `./esbuild` 를 감싸는 얇은 껍데기
 *
 * `esbuild` 는 optional peer 다 — 런타임 레인만 쓰는 소비자(앱)는 안 깔아도 된다.
 *
 * `rollupTypes: true` — 엔트리당 d.ts 한 장으로 만다. 소스 트리를 그대로 내보내면
 * `from './registry'` 같은 확장자 없는 상대 경로가 남는데 `moduleResolution: nodenext`
 * 소비처가 그걸 못 연다. 게이트는 `check:exports`.
 */
export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        esbuild: 'src/esbuild/index.ts',
        cli: 'src/cli/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['esbuild', 'node:fs', 'node:path', 'node:process'],
      output: {
        // bin 은 node 가 직접 실행하므로 shebang 이 필요하다. 엔트리가 여럿이라
        // 전역 banner 를 쓰면 런타임 배럴에도 들어가므로 청크를 골라 붙인다.
        banner: (chunk) => (chunk.name === 'cli' ? '#!/usr/bin/env node' : ''),
      },
    },
  },
})
