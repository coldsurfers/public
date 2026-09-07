import type { Plugin } from 'esbuild'
import { SHARED_SCOPE_KEY } from '../runtime/shared-scope'
import { sharedDependencyNames } from '../shared/get-shared-dependencies'

export type SharedScopePluginOptions = {
  /** 치환할 모듈 이름. 생략하면 카탈로그 전체 */
  include?: string[]
  /** 런타임 전역 키. 호스트의 `SHARED_SCOPE_KEY` 와 같아야 한다 */
  globalKey?: string
}

const NAMESPACE = 'react-native-mf-shared'

/** 이름을 정규식 리터럴로 쓰기 전에 메타문자를 죽인다 — `@gorhom/bottom-sheet` 의 `/`, `.` 등 */
function escapeForRegExp(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
}

/**
 * [2] `react` / `react-native` 같은 shared 모듈을 **글로벌 참조로 치환**한다.
 *
 * 치환하고 나면 원격 번들에 `require(...)` 가 남지 않는다 — 호스트가 모듈 이름을 손으로
 * 나열하던 화이트리스트가 사라지는 지점이다.
 *
 * 치환된 모듈은 **호스트 사본을 그대로** 돌려준다. 없으면 로드 시점에 던진다 —
 * 조용히 `undefined` 를 넘기면 원격 번들 안에서 터져서 원인이 안 보인다.
 *
 * ⚠️ 정확히 일치하는 이름만 잡는다. `react-native/Libraries/...` 같은 deep import 는
 * 그대로 번들된다 — 카탈로그가 패키지 단위라 서브패스는 아직 판정 근거가 없다.
 */
export function sharedScopePlugin(options: SharedScopePluginOptions = {}): Plugin {
  const names = options.include ?? sharedDependencyNames()
  const globalKey = options.globalKey ?? SHARED_SCOPE_KEY
  const filter = new RegExp(`^(?:${names.map(escapeForRegExp).join('|')})$`)

  return {
    name: 'react-native-mf/shared-scope',
    setup(build) {
      if (names.length === 0) return

      build.onResolve({ filter }, (args) => ({ path: args.path, namespace: NAMESPACE }))

      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
        const name = JSON.stringify(args.path)
        const key = JSON.stringify(globalKey)

        return {
          loader: 'js',
          contents: [
            `var scope = globalThis[${key}];`,
            `var mod = scope && scope[${name}];`,
            'if (mod === undefined) {',
            `  throw new Error('[react-native-mf] shared 모듈 "' + ${name} + '" 이 등록돼 있지 않다. 호스트에서 registerShared() 로 먼저 노출한다.');`,
            '}',
            'module.exports = mod;',
          ].join('\n'),
        }
      })
    },
  }
}
