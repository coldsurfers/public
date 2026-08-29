import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — 형태는 `design-system` 과 같고, **왜 별도 패키지인가만 다르다.**
 *
 * `MarkdownRenderer` 는 shiki(core + JS regex engine + 언어 9 + 테마 2)를 모듈 최상단에서
 * 정적으로 물고 `createHighlighterCoreSync()` 를 top-level 로 호출한다. 그건 부수효과라
 * 번들러가 못 턴다 — DS 배럴에 얹으면 `<Button>` 하나 쓰는 소비자도 shiki 를 문다.
 * CSS 는 더 확실하다: DS 는 `cssCodeSplit: false` 라 **CSS 가 한 장**이고 소비자는 그
 * 한 줄을 무조건 import 한다. 산문 CSS 470 줄이 거기 합쳐지면 안 쓰는 소비자도 지불한다.
 *
 * 그래서 패키지를 갈랐다. 진입점·스타일시트가 통째로 분리되므로 `import` 안 하면 0 바이트다.
 *
 * `external` — 무거운 의존(shiki·react-markdown·remark/rehype)은 **번들에 넣지 않는다.**
 * 넣으면 dist 가 수 MB 가 되고, 소비자가 이미 가진 사본과 중복된다.
 */
export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true }),
  ],
  build: {
    lib: { entry: { index: 'src/index.ts' }, formats: ['es'] },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@coldsurfers\/design-system($|\/)/,
        /^shiki($|\/)/,
        /^@shikijs\//,
        'framer-motion',
        'react-markdown',
        'rehype-slug',
        'remark-cjk-friendly',
        'remark-gfm',
      ],
      output: {
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? 'styles.css' : '[name][extname]',
      },
    },
  },
})
