import type { Plugin } from 'esbuild'
import { sharedDependencyNames } from '../shared/get-shared-dependencies'

export type SharedScopePluginOptions = {
  /** 치환할 모듈 이름. 생략하면 카탈로그 전체 */
  include?: string[]
  /** 런타임 전역 키. 호스트의 `SHARED_SCOPE_KEY` 와 같아야 한다 */
  globalKey?: string
}

/**
 * ② `react` / `react-native` 같은 shared 모듈을 **글로벌 참조로 치환**한다.
 *
 * 치환하고 나면 원격 번들에 `require(...)` 가 남지 않는다 — 호스트가 모듈 이름을 손으로
 * 나열하던 화이트리스트가 사라지는 지점이다.
 *
 * ⏸ **Phase 1** — 계약만 세워둔 자리다. `onResolve` 로 가상 네임스페이스에 보내고
 * `onLoad` 에서 `module.exports = globalThis[key][name]` 을 돌려주면 된다.
 */
export function sharedScopePlugin(options: SharedScopePluginOptions = {}): Plugin {
  const names = options.include ?? sharedDependencyNames()

  return {
    name: 'react-native-mf/shared-scope',
    setup() {
      throw new Error(
        `[react-native-mf] sharedScopePlugin 은 아직 구현되지 않았다 (Phase 1). 치환 대상 ${names.length}건.`,
      )
    },
  }
}
