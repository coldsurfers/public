import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — `.css.ts` 를 여기서 컴파일해 내보낸다. 소비자는 VE 플러그인을 달지 않는다.
 *
 * `@coldsurfers/wbe-tokens` 는 external 이다. 값만 보면 인라인해도 되지만, 발행되는 `.d.ts` 가
 * 토큰 패키지를 **타입으로 문다**(`export { color } from '@coldsurfers/wbe-tokens'`). JS 만 보고
 * 판단하면 소비처의 타입이 없는 패키지를 가리키게 된다 — 그래서 런타임 의존으로 선언한다.
 *
 * `@fontsource/*` 는 반대로 external 이다. 번들에 넣으면 폰트 바이너리가 우리 `dist` 로
 * 들어오는데, 그건 소비처 번들러가 자기 asset 파이프라인으로 처리해야 할 몫이다.
 */

/**
 * CSS 를 무는 진입점에 `import './styles.css'` 를 박는다 — 소비자가 배선을 지지 않게 하는 자리.
 * `renderChunk` 인 이유: VE 플러그인이 build 모드에서 `.css.ts` 의 import 를 떼어 asset
 * 파이프라인으로 넘기는데, `renderChunk` 는 그 처리가 끝난 뒤 돌아 여기서 박은 import 가 살아남는다.
 */
const injectStylesImport = {
  name: 'inject-styles-import',
  renderChunk(code: string, chunk: { isEntry: boolean; moduleIds: string[] }) {
    if (!chunk.isEntry) return null
    if (!chunk.moduleIds.some((id) => id.includes('.css.ts'))) return null
    return { code: `import './styles.css';\n${code}`, map: null }
  },
}

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    /**
     * `fonts.ts` 는 제외한다 — 부수효과만 있는 모듈이라 `.d.ts` 가 비는데,
     * api-extractor 가 빈 선언 파일에서 `Unable to determine module` 로 죽는다.
     * 타입이 없는 게 맞는 진입점이라 `exports` 맵에서도 `types` 를 빼 뒀다.
     */
    dts({
      include: ['src'],
      exclude: ['src/fonts.ts'],
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
    }),
  ],
  build: {
    cssMinify: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        sprinkles: 'src/sprinkles.ts',
        fonts: 'src/fonts.ts',
        layers: 'src/layers.ts',
      },
      formats: ['es'],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [/^@fontsource\//, /^@coldsurfers\/wbe-tokens($|\/)/],
      plugins: [injectStylesImport],
      output: {
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? 'styles.css' : '[name][extname]',
      },
    },
  },
})
