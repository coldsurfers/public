import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

/**
 * 라이브러리 빌드 — 형태는 `markdown-renderer` 와 같고(루트 배럴 하나), **왜 배럴을 남겼는가만
 * 다르다.**
 *
 * `shared-utils` 는 루트 배럴을 의도적으로 버렸다(`모듈 하나 = 파일 하나 = 진입점 하나`). 근거는
 * 두 개였다 — 배럴에 (1) DOM 을 무는 모듈이 있으면 DOM lib 없는 소비자의 타입체크를 깨고,
 * (2) 무거운 의존을 무는 모듈이 있으면 안 쓰는 소비자도 설치해야 한다. **여기선 둘 다 0이다.**
 * 외부 의존이 `zod` 하나고 런타임 코드가 없다.
 *
 * 게다가 DTO 들은 서로를 참조하는 그래프다 — `concert.dto` 가 artist·poster·ticket·venue·location
 * 을 문다. 파일을 진입점으로 갈라도 소비자는 결국 대여섯 개를 같이 열어야 하므로, 파일 경계가
 * 공개 API 경계가 되지 못한다. 그래서 `.` 하나만 낸다.
 *
 * ⚠️ `sideEffects: false` — 스키마 정의는 순수 값이라 사실이다. 나중에 모듈 최상단에서
 * 레지스트리 등록 같은 부수효과를 하기 시작하면 이 플래그가 거짓이 되고, 롤업이 그 모듈을
 * 조용히 지운다.
 */

/**
 * external 목록을 `package.json` 에서 파생한다 — **손으로 적은 목록은 조용히 어긋나기 때문.**
 * 의존을 추가하고 여기 적는 걸 잊으면 그 라이브러리가 통째로 `dist` 에 인라인되는데, 빌드도
 * 타입체크도 통과해서 아무도 모른다 (coldsurfers/public#93 리뷰).
 *
 * 문자열 대신 정규식인 이유: 문자열은 정확 일치라 `zod/v4` 같은 **서브패스가 external 을
 * 빠져나가 인라인된다.** npm 이름에서 정규식 특수문자는 `.` 뿐이다.
 */
const manifest = pkg as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

const external = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }).map(
  (name) => new RegExp(`^${name.replace(/\./g, '\\.')}($|/)`),
)

export default defineConfig({
  plugins: [dts({ include: ['src'], tsconfigPath: './tsconfig.json', rollupTypes: true })],
  build: {
    lib: { entry: { index: 'src/index.ts' }, formats: ['es'] },
    rollupOptions: { external },
  },
})
