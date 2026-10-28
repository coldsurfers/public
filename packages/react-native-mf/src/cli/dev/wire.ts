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
 * - `vendor:/<n>` — shared 가 아닌 bare import 를 묶은 의존 청크. `dev` 가 뜬 뒤 처음 보는 패키지는 새 청크다
 * - `vendor:<spec>` — 제 청크에서 패키지 하나를 꺼내는 모듈. spec 은 `/` 로 시작하지 않아 청크와 겹치지 않는다
 */
export type ModuleId = `./${string}` | `vendor:${string}`

/**
 * CJS 몸통 하나. `require` 인자는 `ModuleId` 나 shared specifier 로 다시 써 있고, 지역 모듈은
 * `"use strict"` 로 시작한다. `blockScoping` 이면 `let` · `const` 가 없다.
 */
export type ModuleSource = readonly [id: ModuleId, code: string]

/** `epoch` 은 dev 프로세스마다 하나(base36), `version` 은 코드나 오류를 바꾸는 굽기마다 하나 오른다 */
export type Stamp = { readonly epoch: string; readonly version: number }

export type Boot = {
  name: string
  entry: ModuleId
  /** 이 번들이 구운 상태. 기기 커서가 여기서 시작한다 */
  stamp: Stamp
  modules: ModuleSource[]
  /** 어느 모듈이든 읽는 shared specifier. 첫 모듈을 돌리기 전에 한꺼번에 본다 */
  requires: string[]
  /** `${origin}/${name}/`. 모듈마다 붙는 `//# sourceURL` 의 앞자리. origin 은 번들 요청의 Host 다 */
  sourceRoot: string
  /** `${origin}/${name}/hot`. 같은 서버가 구운 런타임만 부르므로 dev 주소(`dev-address.ts`)에 두지 않는다 */
  hotUrl: string
  /** `REMOTE_REGISTRY_KEY` · `SHARED_SCOPE_KEY`. 런타임이 상수 사본을 들지 않는다 */
  keys: { registry: string; shared: string }
}

/** `have` — 기기 모듈이 반영한 상태. `seen` — 서버가 마지막으로 알려준 상태 */
export type Cursor = { have: Stamp; seen: Stamp }

/** 굽기 오류 하나. `file` 은 미니앱 루트 기준. 파일에 매이지 않는 오류(엔트리를 못 찾음)는 빈 글자다 */
export type PassError = { file: string; message: string }

/**
 * 기기가 받을 것. 서버 상태와 커서에서 매번 새로 계산한다 — 이벤트 기록을 쌓지 않는다.
 *
 * - `update` — `have` 이후 바뀐 모듈과 지워진 id. 놓친 버전은 한 번에 접힌다
 * - `snapshot` — epoch 이 다르다(서버를 다시 띄웠다). 모듈 전부. 기기가 글자로 비교해 바뀐 것만 돌린다
 * - `error` — 마지막 굽기가 실패했다. 오류 전부. 고칠 때까지 모듈은 하나도 보내지 않는다
 *
 * `requires` 는 부팅의 그것처럼 지금 굽기의 shared specifier 전부다. 기기가 적용하기 전에 본다
 */
export type Reply =
  | {
      kind: 'update'
      stamp: Stamp
      modules: ModuleSource[]
      removed: ModuleId[]
      requires: string[]
    }
  | { kind: 'snapshot'; stamp: Stamp; modules: ModuleSource[]; requires: string[] }
  | { kind: 'error'; stamp: Stamp; errors: PassError[] }
