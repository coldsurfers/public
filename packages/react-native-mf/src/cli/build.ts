/**
 * `build` — 미니앱 소스 트리를 원격 번들 **한 장**으로 굽는다.
 *
 * 세 걸음이고 어느 하나도 다른 둘로 대체되지 않는다.
 *
 *   ① babel transpile  미니앱 **자기** config 로. esbuild 가 못 하는 변환이 여기 있다
 *   ② esbuild bundle   `./esbuild` 레인 그대로 — shared 치환 + self-register footer
 *   ③ block-scoping    Hermes 런타임 컴파일러 때문. 아래 `stripBlockScoping` 주석에 상세
 *
 * ①이 왜 필요한가: esbuild 도 TS·JSX 를 먹지만 **AST 를 다시 쓰는 babel 플러그인**은 못 돈다.
 * reanimated 의 worklet 이 대표고, 그건 미니앱의 `babel.config.js` 에 적혀 있다.
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { withSelfRegister } from '../esbuild/register'
import { sharedScopePlugin } from '../esbuild/shared-scope'
import type { BuildOptions } from './build-options'

/**
 * transpile 중간 산출물 자리. **프로젝트 안이어야 한다** — esbuild 는 transpile 된 파일의
 * 위치에서 bare import(`@tanstack/react-query`)를 찾는다. `os.tmpdir()` 로 빼면 거기서 위로
 * 올라가도 `node_modules` 가 없어서 미니앱의 의존성이 통째로 안 잡힌다.
 *
 * `build/` 가 아니라 `node_modules/.cache` 인 이유는 하나 — 소비처가 gitignore 를 새로
 * 쓰지 않아도 되고, 산출물(`--out-file`)과 중간물이 한 디렉터리에서 섞이지 않는다.
 */
const TRANSPILE_CACHE = 'node_modules/.cache/react-native-mf'

const SOURCE_EXTENSION = /\.(?:tsx?|jsx?)$/

/**
 * optional peer 를 **부를 때** 연다.
 *
 * `esbuild` 를 optional peer 로 둔 이유(런타임 레인만 쓰는 앱이 빌드 도구를 안 물게)가
 * babel 에도 그대로 걸린다. 최상단에서 import 하면 `--help` 조차 셋을 다 깔아야 돌고,
 * `./cli` 를 import 만 한 쪽이 모듈 로드에서 터진다.
 */
async function loadEsbuild() {
  try {
    return await import('esbuild')
  } catch (cause) {
    throw new Error('[react-native-mf] esbuild 를 찾을 수 없다. 미니앱에 `esbuild` 를 설치한다.', {
      cause,
    })
  }
}

async function loadBabel() {
  try {
    return await import('@babel/core')
  } catch (cause) {
    throw new Error(
      '[react-native-mf] @babel/core 를 찾을 수 없다. 미니앱에 `@babel/core` 를 설치한다.',
      { cause },
    )
  }
}

/**
 * ① 소스 트리를 통째로 babel 에 태운다.
 *
 * **config 는 미니앱 것을 쓴다.** 이 패키지가 RN 프리셋을 들고 있으면 RN 이나 reanimated 가
 * 올라갈 때마다 여기가 발행돼야 하고, 공개 패키지가 소비자에게 `react-native-reanimated/plugin`
 * 을 강요하게 된다 — shared 목록에서 그은 선과 같은 선이다.
 *
 * `configFile` 을 안 주면 babel 이 `cwd` 에서 `babel.config.*` 를 찾는다. 못 찾으면 변환이
 * 아무것도 안 걸려서 TS 문법에서 **파싱이 터진다** — 조용히 지나가지 않는다.
 */
async function transpileTree(options: BuildOptions, outDir: string): Promise<void> {
  const { transformFileAsync } = await loadBabel()
  const srcDir = resolve(options.cwd, options.src)

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  // `recursive: true` 는 디렉터리 이름도 같이 주는데 확장자 필터가 걸러낸다.
  const entries = await readdir(srcDir, { recursive: true })
  const sources = entries.filter((entry) => SOURCE_EXTENSION.test(entry))

  await Promise.all(
    sources.map(async (relativePath) => {
      const filePath = join(srcDir, relativePath)
      const outputPath = join(outDir, relativePath.replace(SOURCE_EXTENSION, '.js'))

      const result = await transformFileAsync(filePath, {
        root: options.cwd,
        cwd: options.cwd,
        configFile: options.babelConfig,
      })

      if (result?.code == null) {
        throw new Error(`[react-native-mf] babel 이 "${relativePath}" 를 변환하지 못했다.`)
      }

      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, result.code)
    }),
  )
}

/**
 * ② 번들. `external` 이 아니라 shared 치환을 쓴다 — `external` 은 `require(...)` 를 그대로
 * 남겨서 호스트가 이름마다 분기하는 화이트리스트를 들어야 했다.
 *
 * `format`·`globalName`·`footer` 는 `withSelfRegister` 가 잡으므로 여기서 정하지 않는다.
 */
async function bundle(options: BuildOptions, entryPath: string): Promise<string> {
  const esbuild = await loadEsbuild()

  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    // ③ 이 산출물을 다시 받아야 해서 esbuild 가 직접 쓰지 않는다.
    write: false,
    outfile: resolve(options.cwd, options.outFile),
    absWorkingDir: options.cwd,
    platform: 'node',
    target: ['es2015'],
    plugins: [sharedScopePlugin({ include: options.shared })],
    // RN 코드가 `global` 을 짚는다. 원격 번들은 호스트 런타임 위에서 도는데 그 이름이
    // 있고 없고가 런타임마다 갈려서 `globalThis` 로 고정한다.
    define: { global: 'globalThis' },
    ...withSelfRegister({ name: options.name }),
  })

  const [output] = result.outputFiles ?? []
  if (!output) throw new Error('[react-native-mf] esbuild 가 산출물을 내지 않았다.')

  return output.text
}

/**
 * ③ 블록 스코프를 걷어낸다.
 *
 * 원격 번들만 `new Function` 으로 실행된다 — 호스트처럼 hermesc 를 타지 않고 Hermes 의
 * **런타임 컴파일러**를 탄다. 그쪽은 루프 안 `let` 을 반복마다 새 바인딩으로 만들지 않아서
 * 클로저가 마지막 값을 붙든다. esbuild 가 CJS 인터롭용으로 넣는 `__copyProps` 가 정확히 그
 * 모양이라, shared 모듈의 **모든 프로퍼티가 마지막 export 하나로** 읽혔다
 * (`QueryClient` → `skipToken`, 그래서 `new Symbol()`).
 *
 * 헬퍼 한 줄을 고치는 대신 산출물에서 `let`/`const` 를 통째로 없앤다 — 미니앱 자기 코드가
 * 같은 자리를 밟는 것도 같이 막힌다. 크기는 거의 그대로고 한 번 더 도는 비용은 ~50ms.
 *
 * 그래도 **옵션**인 이유: 이건 Hermes 런타임 컴파일러의 사실이지 이 CLI 의 사실이 아니다.
 * 바이트코드로 미리 굽거나 다른 엔진에 올리는 소비처는 `--no-block-scoping` 으로 끈다.
 */
async function stripBlockScoping(code: string): Promise<string> {
  const { transformAsync } = await loadBabel()

  // 플러그인을 **이 패키지 위치에서** 해석한다. optional peer 라 소비처 트리에 깔리는데,
  // 경로 문자열로 넘겨야 babel 이 플러그인 identity·캐시를 자기 규칙대로 잡는다.
  let plugin: string
  try {
    plugin = createRequire(import.meta.url).resolve('@babel/plugin-transform-block-scoping')
  } catch (cause) {
    throw new Error(
      '[react-native-mf] @babel/plugin-transform-block-scoping 을 찾을 수 없다. ' +
        '설치하거나 `--no-block-scoping` 으로 끈다.',
      { cause },
    )
  }

  const result = await transformAsync(code, {
    configFile: false,
    babelrc: false,
    compact: false,
    // 번들은 iife 한 덩어리라 모듈이 아니다. `module` 로 읽히면 최상위가 strict 가 된다.
    sourceType: 'script',
    plugins: [plugin],
  })

  if (result?.code == null) {
    throw new Error('[react-native-mf] block-scoping 후처리가 코드를 내지 않았다.')
  }

  return result.code
}

export type BuildResult = {
  /** 실제로 쓴 절대 경로 */
  outFile: string
  bytes: number
}

export async function runBuild(options: BuildOptions): Promise<BuildResult> {
  const transpileDir = join(resolve(options.cwd, TRANSPILE_CACHE), options.name)
  await transpileTree(options, transpileDir)

  // transpile 이 확장자를 `.js` 로 바꿔놨다 — 엔트리도 같은 규칙으로 따라간다.
  const entryPath = join(transpileDir, options.entry.replace(SOURCE_EXTENSION, '.js'))

  const bundled = await bundle(options, entryPath)
  const code = options.blockScoping ? await stripBlockScoping(bundled) : bundled

  const outFile = resolve(options.cwd, options.outFile)
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, code)

  return { outFile, bytes: Buffer.byteLength(code) }
}
