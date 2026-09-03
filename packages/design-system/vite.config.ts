import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'
import { buildTokensCss } from './scripts/tokens-css'

/**
 * 라이브러리 빌드 — **`.css.ts` 를 여기서 컴파일해 내보낸다.**
 *
 * 소스를 그대로 발행하면 소비자마다 VE 번들러 플러그인을 달고 `node_modules` 까지 처리하도록
 * 열어야 한다. 공개 패키지에서 그건 계약이 아니라 부탁이다. 그래서 CSS 는 여기서 굽고,
 * **소비자는 아무것도 안 진다** — 아래 `injectStylesImport` 가 진입점에 CSS 를 물려 보낸다.
 *
 * `cssCodeSplit: false` — 이유는 **소비자 편의 하나뿐이다.** 배선이 아예 없다.
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

/**
 * CSS 를 무는 진입점에 `import './styles.css'` 를 박는다. 소비자가 배선을 지지 않게 하는 자리.
 *
 * **왜 `renderChunk` 인가:** Vite 의 VE 플러그인은 build 모드에서 `.css.ts` 의 CSS import 를
 * *떼어내* asset 파이프라인으로 넘긴다 — 앱이면 HTML 이 주워가지만 라이브러리엔 주워갈 HTML 이
 * 없다. `renderChunk` 는 그 처리가 **끝난 뒤** 돌아서, 여기서 박은 import 는 살아남는다.
 * (source 단계에 박으면 같이 떼여 사라진다. 실측: coldsurfers/public#1)
 *
 * **왜 목록이 아니라 판정인가:** 대상을 진입점 이름으로 적으면 이름을 바꿀 때 조용히 어긋난다.
 * 대신 그 청크가 실제로 `.css.ts` 를 물었는지를 본다 — 진입점을 늘리든 이름을 바꾸든 따라온다.
 * (실측 시점 기준 index·primitives·cards·layout·motion·sprinkles 만 걸린다.)
 *
 * 이 판정이 곧 두 규칙의 집행이기도 하다. `native` 는 RN 이라 CSS 를 물면 Metro 가 깨지고,
 * `tokens`·`tokens-native`·`style-utils` 는 번들러 없이 Node 에서 여는 길을 남겨둔다
 * (CSS 를 물리면 `Unknown file extension ".css"` 로 막힌다) — 넷 다 `.css.ts` 가 없어서 걸리지
 * 않는다. 거기에 `.css.ts` 가 들어오는 순간 이 규칙이 깨진 것이고, 주입은 그 신호를 따라간다.
 */
const injectStylesImport = {
  name: 'inject-styles-import',
  renderChunk(code: string, chunk: { isEntry: boolean; moduleIds: string[] }) {
    if (!chunk.isEntry) return null
    if (!chunk.moduleIds.some((id) => id.includes('.css.ts'))) return null
    return { code: `import './styles.css';\n${code}`, map: null }
  },
}

/**
 * `dist/tokens.css` — 변수만 담은 두 번째 CSS 진입점. 내용과 무레이어 근거는 `scripts/tokens-css.ts`.
 *
 * VE 산출물이 아니라 토큰 값에서 직접 굽는다. `styles.css` 에서 변수 블록만 도려내려면 VE 가
 * 어느 청크에 무엇을 실었는지에 의존해야 하는데, 그건 빌드 내부 사정이라 계약으로 삼을 수 없다.
 *
 * `fileName` 을 못박으므로 아래 `assetFileNames`(모든 `.css` → `styles.css`)를 타지 않는다.
 */
const emitTokensCss: Plugin = {
  name: 'emit-tokens-css',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'tokens.css', source: buildTokensCss() })
  },
}

export default defineConfig({
  plugins: [
    vanillaExtractPlugin(),
    dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true }),
    emitTokensCss,
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        tokens: 'src/tokens/index.ts',
        'tokens-native': 'src/tokens/native.ts',
        primitives: 'src/primitives/index.ts',
        cards: 'src/cards/index.ts',
        layout: 'src/layout/index.ts',
        native: 'src/native/index.ts',
        sprinkles: 'src/sprinkles.ts',
        'style-utils': 'src/css/style-utils.ts',
        motion: 'src/css/motion.css.ts',
      },
      formats: ['es'],
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-native',
        '@emotion/native',
        '@emotion/react',
      ],
      plugins: [injectStylesImport],
      output: {
        assetFileNames: (asset) =>
          asset.names?.[0]?.endsWith('.css') ? 'styles.css' : '[name][extname]',
      },
    },
  },
})
