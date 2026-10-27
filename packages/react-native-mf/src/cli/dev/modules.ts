/**
 * dev 번들의 Node 쪽. 기기 런타임을 글자로 묶고, 모듈과 합쳐 번들 한 장을 만든다.
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEsbuild, stripBlockScoping } from '../build'
import type { Boot } from './wire'

const RUNTIME_GLOBAL = '__rnmfDevRuntime'

// 발행본은 vite 가 청크 옆에 낸 `dev-runtime.js` 를, tsx 로 도는 소스는 `runtime.ts` 를 묶는다
const here = dirname(fileURLToPath(import.meta.url))
const RUNTIME_INPUT = import.meta.url.endsWith('.ts')
  ? join(here, 'runtime.ts')
  : join(here, 'dev-runtime.js')

/**
 * 기기 런타임 글자. 서버와 테스트가 이 한 걸음을 같이 지난다.
 *
 * `Function.prototype.toString` 으로 꺼내지 않는다. tsx 가 소스에 `__name(...)` 을 넣어 테스트와
 * 발행본의 글자가 갈렸다. esbuild 로 다시 묶으면 헬퍼까지 안에 들어가 바깥 참조가 없다. 기기는
 * `new Function` 으로 돌리므로 모듈과 같은 이유로 block-scoping 을 탄다.
 */
export async function buildRuntime(options: {
  blockScoping: boolean
  input?: string
}): Promise<string> {
  const esbuild = await loadEsbuild()
  const result = await esbuild.build({
    entryPoints: [options.input ?? RUNTIME_INPUT],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: RUNTIME_GLOBAL,
    platform: 'neutral',
    target: ['es2015'],
    logLevel: 'silent',
  })
  const [output] = result.outputFiles
  if (!output) throw new Error('[react-native-mf] esbuild 가 dev 런타임을 내지 않았다.')
  return options.blockScoping ? stripBlockScoping(output.text) : output.text
}

/** 번들 한 장. 런타임을 정의하고 곧바로 부팅한다 */
export const bundleText = (boot: Boot, runtime: string) =>
  `${runtime}\n${RUNTIME_GLOBAL}.bootDevRemote(${JSON.stringify(boot)}, globalThis);\n`
