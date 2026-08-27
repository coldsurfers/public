import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — **`.css.ts` 를 여기서 컴파일해 내보낸다.**
 *
 * 소스를 그대로 발행하면 소비자마다 VE 번들러 플러그인을 달고 `node_modules` 까지 처리하도록
 * 열어야 한다. 공개 패키지에서 그건 계약이 아니라 부탁이다. 그래서 CSS 는 여기서 굽고,
 * 소비자는 `import '@coldsurfers/design-system/styles.css'` 한 줄만 진다.
 *
 * `cssCodeSplit: false` — 이유는 **소비자 편의 하나뿐이다.** import 한 줄로 끝난다.
 * 대가는 tree-shaking: `<Button>` 하나 쓰는 소비자도 DS CSS 전량을 문다.
 * VE 가 라이브러리용으로 권하는 건 반대쪽(`preserveModules` + 모듈별 CSS)이다.
 * 재검토: coldsurfers/public#1 — 실제 소비자가 붙기 전에 정한다.
 *
 * ⚠️ 이 설정을 `@layer` 순서 때문이라고 적지 말 것. 순서는 `layers.css.ts` 가
 *    선언을 중복 발행해 이미 지킨다(`@layer a,b,c;` 는 이름이 있으면 no-op).
 *
 * `rollupTypes: true` — 엔트리당 d.ts 한 장으로 만다. 소스 트리를 그대로 내보내면
 * `export { vars } from './css/contract.css'` 처럼 확장자 없는 상대 경로가 남는데,
 * `moduleResolution: nodenext` 소비처는 그걸 못 연다(우리 빌드·타입체크는 통과한다).
 * 게이트는 `check:exports`.
 */
export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        tokens: 'src/tokens/index.ts',
        primitives: 'src/primitives/index.ts',
        sprinkles: 'src/sprinkles.ts',
        'style-utils': 'src/css/style-utils.ts',
        motion: 'src/css/motion.css.ts',
      },
      formats: ['es'],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? 'styles.css' : '[name][extname]',
      },
    },
  },
})
