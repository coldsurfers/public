import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — **소스가 아니라 `dist` 를 발행한다.**
 *
 * paul-rockstar 에 있을 때는 raw `src` 를 발행했고, 그래서 소비처가 transpile 설정을
 * 지고 있었다(`auth-portal`·`coldsurf-studio` 의 `transpilePackages`). 이 레포의 다른
 * 패키지와 같은 규격으로 맞춘다 — 발행본은 빌드본이다.
 *
 * 진입점은 하나(`.`). 런타임 의존이 없어 external 도 비운다 — `fetch` 와 저장소는
 * 전부 주입식이라 번들에 들어갈 남의 코드가 없다.
 *
 * `rollupTypes: true` — d.ts 를 한 장으로 만다. 소스 트리를 그대로 내보내면
 * `from './errors'` 같은 확장자 없는 상대 경로가 남고 `moduleResolution: nodenext`
 * 소비처가 그걸 못 연다. 게이트는 `check:exports`.
 */
export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es'],
    },
  },
})
