import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

/**
 * 라이브러리 빌드 — 형태는 `design-system`·`markdown-renderer` 와 같고, **왜 별도 패키지인가만
 * 다르다.** 이쪽은 렌더링이 없다: 프레임워크·DOM 에 기대지 않는 순수 함수만 모은다.
 *
 * ⚠️ **루트 배럴이 없다.** `모듈 하나 = 파일 하나 = 진입점 하나` 이고 예외가 없다:
 * `src/date.ts` → `dist/date.js` → `@coldsurfers/shared-utils/date`.
 *
 * 배럴을 없앤 이유는 취향이 아니라 **공개 API 가 구현 세부에 묶이는 것**을 끊기 위해서다.
 * 배럴이 있으면 "무엇을 배럴에 올리는가"를 정해야 하는데, 그 기준이 결국 두 가지로 수렴한다 —
 * (1) DOM·React 를 무는가(무는 순간 배럴 한 줄이 DOM lib 없는 소비자의 타입체크를 깬다),
 * (2) 무거운 의존을 무는가(무는 순간 그 유틸을 안 쓰는 소비자도 설치해야 한다. 번들러가
 * 털어주지 않는다 — **해소가 tree-shaking 보다 먼저**라, 없는 모듈은 그래프 단계에서 죽는다).
 * 둘 다 **모듈 내부 사정**이다. 그걸 배럴 소속에 연결하면, 유틸이 의존을 하나 무는 순간
 * 배럴에서 빠져야 하고 그게 major breaking 이 된다. 진입점만 있으면 그 이동이 아예 없다.
 *
 * ⚠️ **파일 이름은 평평하다(`dist/date.js`).** `dist/date/index` 처럼 중첩해 내보내면
 * `rollupTypes` 가 그 엔트리에 안 먹어 `.d.ts` 에 소스 트리 경로가 남는다
 * (`design-system` 의 `native/Button` 이 같은 이유로 평평하다).
 */

/**
 * 진입점을 `package.json` 의 `exports` 에서 파생한다 — 목록이 두 군데 있으면 어긋난다.
 *
 * `exports` 가 선언이고, `src/*.ts` 가 사실이고, `scripts/check-entries.mjs` 가 둘을 묶는다
 * (모듈을 추가하고 `exports` 갱신을 잊으면 `check:exports` 가 실패한다).
 */
const entry = Object.fromEntries(
  Object.keys(pkg.exports)
    .filter((path) => path.startsWith('./') && path !== './package.json')
    .map((path) => {
      const name = path.slice(2)
      return [name, `src/${name}.ts`]
    }),
)

/**
 * external 목록을 `package.json` 에서 파생한다 — **손으로 적은 목록은 조용히 어긋나기 때문.**
 * 의존을 추가하고 여기 적는 걸 잊으면 그 라이브러리가 통째로 `dist` 에 인라인되는데,
 * 빌드도 타입체크도 통과해서 아무도 모른다 (coldsurfers/public#93 리뷰).
 *
 * `dependencies` 와 `peerDependencies` **둘 다** 문다 — 어느 쪽에 적히든 번들에서 빠져야 하는
 * 건 같다. 소비자에게 안 물릴 가벼운 의존을 `dependencies` 로 들고 와도 그대로 external 이 된다.
 *
 * 이름을 문자열로 넣지 않고 정규식으로 바꾸는 이유: 문자열은 정확 일치라 `date-fns/locale` 같은
 * **서브패스가 external 을 빠져나가 인라인된다.** npm 이름에서 정규식 특수문자는 `.` 뿐이다.
 */
const manifest = pkg as {
  dependencies?: Record<string, string>
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
    lib: { entry, formats: ['es'] },
    rollupOptions: { external },
  },
})
