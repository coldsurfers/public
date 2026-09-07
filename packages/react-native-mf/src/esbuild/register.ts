import type { BuildOptions } from 'esbuild'
import { REMOTE_REGISTRY_KEY } from '../runtime/registry'

export type RegisterOptions = {
  /** 원격 레지스트리에 등록될 이름. 호스트가 이 이름으로 회수한다 */
  name: string
  /** 런타임 전역 키. 호스트의 `REMOTE_REGISTRY_KEY` 와 같아야 한다 */
  globalKey?: string
}

/** iife 가 자기 exports 를 잠깐 걸어두는 자리. footer 가 읽고 레지스트리로 옮긴다. */
const ENTRY_GLOBAL = '__RN_MF_REMOTE_ENTRY__'

/**
 * [3] self-register — 번들이 실행되면 **스스로** 레지스트리에 올라간다.
 *
 * `new Function` 이 `module.exports` 로 결과를 되돌려주던 자리의 대체다. 실행 방식(소스 eval ·
 * 바이트코드)이 뭐든 회수 지점이 한 곳으로 고정된다.
 *
 * 등록되는 값은 **모듈 네임스페이스 그대로**다 — `export default` 를 쓴 번들이면
 * 호스트가 `getRemote(name).default` 로 꺼낸다. 여기서 `.default` 를 풀지 않는 건
 * 원격 번들이 named export 를 여러 개 내보낼 수 있어서다.
 *
 * 반환값은 esbuild 빌드 옵션 **조각**이다 — 소비자의 옵션에 펼쳐 넣는다.
 *
 * ```ts
 * await esbuild.build({ ...base, ...withSelfRegister({ name: 'settings' }) })
 * ```
 */
export function withSelfRegister(options: RegisterOptions): Partial<BuildOptions> {
  const key = JSON.stringify(options.globalKey ?? REMOTE_REGISTRY_KEY)
  const name = JSON.stringify(options.name)

  return {
    format: 'iife',
    globalName: ENTRY_GLOBAL,
    footer: {
      js: [
        `globalThis[${key}] = globalThis[${key}] || {};`,
        `globalThis[${key}][${name}] = ${ENTRY_GLOBAL};`,
      ].join('\n'),
    },
  }
}
