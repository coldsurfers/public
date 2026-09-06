import type { BuildOptions } from 'esbuild'

export type RegisterOptions = {
  /** 원격 레지스트리에 등록될 이름. 호스트가 이 이름으로 회수한다 */
  name: string
  /** 런타임 전역 키. 호스트의 `REMOTE_REGISTRY_KEY` 와 같아야 한다 */
  globalKey?: string
}

/**
 * ③ self-register — 번들이 실행되면 **스스로** 레지스트리에 올라간다.
 *
 * `new Function` 이 `module.exports` 로 결과를 되돌려주던 자리의 대체다. 실행 방식(소스 eval ·
 * 바이트코드)이 뭐든 회수 지점이 한 곳으로 고정된다.
 *
 * ⏸ **Phase 1** — `format: 'iife'` + `globalName` + footer 를 얹는 빌드 옵션 조각을 돌려준다.
 */
export function withSelfRegister(_options: RegisterOptions): Partial<BuildOptions> {
  throw new Error('[react-native-mf] withSelfRegister 는 아직 구현되지 않았다 (Phase 1).')
}
