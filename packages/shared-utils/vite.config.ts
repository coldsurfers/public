import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — 형태는 `design-system`·`markdown-renderer` 와 같고, **왜 별도 패키지인가만
 * 다르다.** 이쪽은 렌더링이 없다: 프레임워크·DOM 에 기대지 않는 순수 함수만 모은다.
 *
 * ⚠️ **루트 배럴(`src/index.ts`)에 DOM·React·Next 를 무는 유틸을 올리지 않는다.** 올리는 순간
 * DOM lib 없이 도는 소비자(Fastify 서버 등)의 타입체크가 배럴 한 줄 때문에 깨진다 — 그 유틸이
 * 실제로 쓰이는지와 무관하게. 그런 유틸은 진입점을 갈라 서브패스(`./react` 같은)로만 연다.
 * 이 패키지가 도메인별 진입점으로 시작하는 이유가 그거다.
 *
 * ⚠️ **파일 이름은 평평하고(`dist/date.js`), 공개 경로만 중첩이다(`./date`).** `dist/date/index`
 * 처럼 중첩해 내보내면 `rollupTypes` 가 그 엔트리에 안 먹어 `.d.ts` 에 소스 트리 경로가 남는다
 * (`design-system` 의 `native/Button` 이 같은 이유로 평평하다). 둘을 갈라 주는 게 `exports` 맵의 일.
 *
 * `external` — `date-fns`·`date-fns-tz` 는 번들에 넣지 않는다. 소비자가 이미 가진 사본과
 * 중복되고, 트리셰이킹도 소비자 쪽에서 하는 편이 낫다.
 */
export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts'],
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        date: 'src/date/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^date-fns($|\/)/, /^date-fns-tz($|\/)/],
    },
  },
})
