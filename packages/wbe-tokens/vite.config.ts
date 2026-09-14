import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/**
 * 라이브러리 빌드 — 값과 이름 규칙만 담은 배럴 하나라 진입점도 하나다.
 *
 * `external` 목록이 없다. **런타임 의존이 0개**이기 때문이고, 그게 이 패키지의 성질이다.
 * 의존이 생기면 `data-models` 처럼 `package.json` 에서 파생시킨다 — 손으로 적은 목록은
 * 의존을 추가할 때 조용히 어긋나고, 빠진 라이브러리는 통째로 `dist` 에 인라인된다(#93 리뷰).
 *
 * 소스를 발행하지 않는 이유는 소비처를 늘리지 않기 위해서다. `exports` 가 `src` 를 가리키면
 * 소비처가 이 패키지의 TS 를 자기 파이프라인으로 컴파일해야 한다 — 그건 계약이 아니라 부탁이다.
 */
export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: { entry: { index: 'src/index.ts' }, formats: ['es'] },
  },
})
