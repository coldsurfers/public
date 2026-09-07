import type { Plugin } from 'esbuild'
import { SHARED_SCOPE_KEY } from '../runtime/shared-scope'

/**
 * 어떤 RN 마이크로프론트엔드든 shared 여야 하는 최소 집합.
 *
 * React 가 둘이면 훅이 깨지고, `react/jsx-runtime` 을 빼면 JSX 변환이 조용히 두 번째 사본을
 * 물고 온다. `react-native` 는 네이티브 모듈 레지스트리를 들고 있다.
 *
 * **그 밖의 목록은 소비처가 정한다.** 어떤 라이브러리를 shared 로 볼지는 호스트 앱의 사실이지
 * 이 패키지의 사실이 아니다 — `include` 로 넘긴다.
 */
export const DEFAULT_SHARED_MODULES = ['react', 'react/jsx-runtime', 'react-native'] as const

export type SharedScopePluginOptions = {
  /**
   * 치환할 모듈 이름. 생략하면 `DEFAULT_SHARED_MODULES`.
   *
   * 끝의 `/*` 는 **서브패스 와일드카드**다 — `'react-native/*'` 는 `react-native/Libraries/...`
   * 를 잡되 맨 이름 `react-native` 는 잡지 않는다. 둘 다 원하면 둘 다 적는다.
   */
  include?: readonly string[]
  /** 런타임 전역 키. 호스트의 `SHARED_SCOPE_KEY` 와 같아야 한다 */
  globalKey?: string
}

const NAMESPACE = 'react-native-mf-shared'

/** 이름을 정규식 리터럴로 쓰기 전에 메타문자를 죽인다 — `@gorhom/bottom-sheet` 의 `/`, `.` 등 */
function escapeForRegExp(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')
}

/** `'react-native/*'` → 서브패스만 잡는 패턴. 그 외는 정확히 일치. */
function toPattern(name: string): string {
  return name.endsWith('/*') ? `${escapeForRegExp(name.slice(0, -2))}\\/.+` : escapeForRegExp(name)
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
 * 조회 키는 **소비자가 쓴 specifier 그대로**다. `react/jsx-runtime` 을 치환했으면 호스트도
 * 그 이름으로 `registerShared` 해야 한다 — 부모 패키지에서 유도하지 않는다.
 */
export function sharedScopePlugin(options: SharedScopePluginOptions = {}): Plugin {
  const names = options.include ?? DEFAULT_SHARED_MODULES
  const globalKey = options.globalKey ?? SHARED_SCOPE_KEY
  const filter = new RegExp(`^(?:${names.map(toPattern).join('|')})$`)

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
