/**
 * dev 번들의 모양. 서버(Node)와 기기 런타임(`./runtime`)이 같이 문다. 타입만 둔다.
 *
 * 둘은 언제나 **같은 CLI 버전이 한 응답에 실어** 보낸다. 호스트는 이 모양을 모르고 `exports` 에도
 * 없으니 바꿔도 major 가 아니다. 호스트와 맞춰야 하는 건 지금도 셋뿐이다 — dev 주소, 전역 두 칸,
 * RN 의 `__ReactRefresh`.
 */

/**
 * 모듈 키. 기기에선 불투명하다.
 *
 * - `./settings-screen/index.tsx` — `src` 기준 소스 경로
 * - `vendor:` — shared 가 아닌 bare import 를 한데 묶은 청크
 * - `vendor:<spec>` — 그 청크에서 패키지 하나를 꺼내는 모듈
 */
export type ModuleId = `./${string}` | `vendor:${string}`

/**
 * CJS 몸통 하나. `require` 인자는 `ModuleId` 나 shared specifier 로 다시 써 있고, 지역 모듈은
 * `"use strict"` 로 시작한다. `blockScoping` 이면 `let` · `const` 가 없다.
 */
export type ModuleSource = readonly [id: ModuleId, code: string]

export type Boot = {
  name: string
  entry: ModuleId
  modules: ModuleSource[]
  /** 어느 모듈이든 읽는 shared specifier. 첫 모듈을 돌리기 전에 한꺼번에 본다 */
  requires: string[]
  /** `${origin}/${name}/`. 모듈마다 붙는 `//# sourceURL` 의 앞자리. origin 은 번들 요청의 Host 다 */
  sourceRoot: string
  /** `REMOTE_REGISTRY_KEY` · `SHARED_SCOPE_KEY`. 런타임이 상수 사본을 들지 않는다 */
  keys: { registry: string; shared: string }
}
