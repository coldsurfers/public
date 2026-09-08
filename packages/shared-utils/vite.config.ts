import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

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
 * `external` — 선언한 의존은 번들에 넣지 않는다. 소비자가 이미 가진 사본과 중복되고,
 * 트리셰이킹도 소비자 쪽에서 하는 편이 낫다. 목록은 아래에서 매니페스트로부터 파생한다.
 */

/**
 * external 목록을 `package.json` 에서 파생한다 — **손으로 적은 목록은 조용히 어긋나기 때문.**
 * 의존을 추가하고 여기 적는 걸 잊으면 그 라이브러리가 통째로 `dist` 에 인라인되는데,
 * 빌드도 타입체크도 통과해서 아무도 모른다 (coldsurfers/public#93 리뷰).
 *
 * `dependencies` 와 `peerDependencies` **둘 다** 문다. external 은 「번들에 인라인하지 않는다」이고
 * peer 는 「소비자가 사본 하나를 공유한다」로 축이 다르다 — 어느 쪽이든 번들에서는 빠져야 한다.
 * (`markdown-renderer` 도 `shiki`·`react-markdown` 을 `dependencies` 로 두고 external 로 뺀다.)
 *
 * 이름을 문자열로 넣지 않고 정규식으로 바꾸는 이유: 문자열은 정확 일치라 `date-fns/locale` 같은
 * **서브패스가 external 을 빠져나가 인라인된다.** npm 이름에서 정규식 특수문자는 `.` 뿐이다.
 */
const manifest = pkg as {
  dependencies?: Record<string, string>
  // 지금은 없다. 생겼을 때 이 파일을 같이 고쳐야 하는 상황을 만들지 않으려고 미리 읽는다.
  peerDependencies?: Record<string, string>
}

const external = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }).map(
  (name) => new RegExp(`^${name.replace(/\./g, '\\.')}($|/)`),
)

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
      external,
    },
  },
})
