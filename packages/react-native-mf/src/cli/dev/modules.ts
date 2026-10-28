/**
 * dev 번들의 Node 쪽. 소스 트리를 모듈 단위 CJS 로 굽고, 기기 런타임과 합쳐 번들 한 장을 만든다.
 *
 * build 레인의 세 걸음을 모듈마다 한다.
 *
 *   ① babel          미니앱 config 그대로에 react-refresh/babel 을 얹는다. 글자가 바뀐 파일만
 *   ② esbuild        엔트리에서 닿는 파일마다 CJS 하나. import 는 전부 밖에 두고 경로만 `ModuleId` 로
 *   ③ block-scoping  모듈마다. esbuild 의 `__copyProps` 가 모듈마다 들어간다
 *
 * shared 가 아닌 bare import 는 의존 청크(`vendor:/<n>`)로 묶는다. 처음 굽기는 전부 한 청크다 —
 * 패키지마다 따로 묶으면 둘이 같이 쓰는 의존이 사본으로 갈린다. 그 뒤 처음 보는 패키지는 그것만 담은
 * 청크로 더한다. 실린 청크의 글자가 그대로여서 기기가 실린 패키지를 다시 돌리지 않는다.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BuildOptions, Message, Plugin } from 'esbuild'
import { sharedMatcher } from '../../esbuild/shared-scope'
import { loadEsbuild, SOURCE_EXTENSION, stripBlockScoping, transpileFile } from '../build'
import type { CompileOptions } from '../build-options'
import type { Boot, ModuleId, PassError } from './wire'

export type ModuleBuild = { source: string; code: string }

/** 굽기 한 번. 실패도 값이다. 실패는 모은 오류 전부를 든다 */
export type PassResult =
  | { ok: true; modules: ReadonlyMap<ModuleId, ModuleBuild>; requires: readonly string[] }
  | { ok: false; errors: readonly PassError[] }

const VENDOR: ModuleId = 'vendor:'

type VendorChunk = { id: ModuleId; source: string; code: string; requires: readonly string[] }

/** 굽기를 넘어 남는 의존 청크. 한 번 실은 spec 은 import 가 빠져도 남는다 */
type Vendor = {
  /** 이 청크들을 묶은 `options.shared`. 바뀌면 처음부터 다시 묶는다 */
  shared: string
  chunks: VendorChunk[]
  chunkOf: Map<string, ModuleId>
  /** 청크가 내보내는 파일 → 그 spec. 새 청크는 이 파일을 묶지 않고 그 spec 의 모듈을 부른다 */
  specAt: Map<string, string>
}

/** 링크 산출물 경로. `write: false` 라 쓰이지 않는다 */
const LINK_OUTDIR = 'build/.dev-link'
/** 플러그인이 `build.resolve` 로 기본 풀이를 부를 때 자기 자신을 건너뛰는 표식 */
const RESOLVING = 'react-native-mf/resolving'

const toModuleId = (srcDir: string, path: string): ModuleId =>
  `./${relative(srcDir, path).split(sep).join('/')}`

/** `dev` 가 부팅에 넘기는 엔트리. 모듈과 같은 규칙으로 키를 만든다 */
export function entryId(options: CompileOptions): ModuleId {
  const srcDir = resolve(options.cwd, options.src)
  return toModuleId(srcDir, resolve(srcDir, options.entry))
}

/**
 * 부를 때마다 트리를 엔트리에서 다시 따라간다. 옵션도 다시 푼다 — `sharedFrom` 매니페스트를 호스트가
 * 다시 내면 다음 굽기가 본다.
 *
 * 같은 글자는 다시 굽지 않는다. babel · block-scoping 은 입력 글자로, 의존 청크는 spec 으로 기억한다.
 * 링크는 매번 전부 한다. 파일이 생기거나 지워지면 풀이가 바뀌는데, 그걸 따로 추적하는 것보다 esbuild
 * 한 번이 싸다.
 */
export function createModuleCompiler(
  resolveOptions: () => Promise<CompileOptions>,
): () => Promise<PassResult> {
  const transpiled = new Map<string, { source: string; code: Promise<string> }>()
  const scoped = new Map<ModuleId, { input: string; output: Promise<string> }>()
  let vendor: Vendor | undefined
  // `shared` 가 바뀌어 다시 묶어도 이어 센다. 기기에 남은 옛 청크와 id 가 겹치지 않는다
  let chunkCount = 0

  return async () => {
    const options = await resolveOptions()
    const esbuild = await loadEsbuild()
    const srcDir = resolve(options.cwd, options.src)
    const isShared = sharedMatcher(options.shared)
    const refresh = resolveRefreshPlugin(options.cwd)

    const sources = new Map<string, string>()
    const requires = new Set<string>()
    const vendorSpecs = new Set<string>()
    const errors: PassError[] = []

    const transpile = (path: string, source: string) => {
      const known = transpiled.get(path)
      if (known?.source === source) return known.code
      const code = transpileFile(options, relative(srcDir, path), source, [
        [refresh, { skipEnvCheck: true }],
      ])
      transpiled.set(path, { source, code })
      return code
    }

    // `link` 가 거짓이면 지역 import 를 따라가 닿는 파일을 모으고, 참이면 밖에 두고 `ModuleId` 로 쓴다
    const modulesPlugin = (link: boolean): Plugin => ({
      name: 'react-native-mf/dev-modules',
      setup(build) {
        build.onResolve({ filter: /.*/ }, async (args) => {
          if (args.kind === 'entry-point' || args.pluginData === RESOLVING) return undefined
          if (isShared.test(args.path)) {
            requires.add(args.path)
            return { path: args.path, external: true }
          }
          const resolved = await build.resolve(args.path, {
            kind: args.kind,
            importer: args.importer,
            resolveDir: args.resolveDir,
            pluginData: RESOLVING,
          })
          if (resolved.errors.length > 0) return { errors: resolved.errors }
          // tsconfig `paths` 별칭은 bare 로 적혀도 src 파일을 연다. 의존 청크로 보내면 고쳐도 다시 묶지 않는다
          const local =
            args.path.startsWith('.') ||
            args.path.startsWith('/') ||
            (resolved.path.startsWith(`${srcDir}${sep}`) &&
              !relative(srcDir, resolved.path).split(sep).includes('node_modules'))
          if (!local) {
            vendorSpecs.add(args.path)
            return { path: `${VENDOR}${args.path}`, external: true }
          }
          return link
            ? { path: toModuleId(srcDir, resolved.path), external: true }
            : { path: resolved.path }
        })

        // 굽기 한 번에 파일은 한 번만 읽는다. 링크가 다시 읽으면 그 사이 저장한 글자가 그래프와 어긋난다
        build.onLoad({ filter: /.*/ }, async ({ path }) => {
          const source = sources.get(path) ?? (await readFile(path, 'utf8'))
          sources.set(path, source)
          if (!path.startsWith(`${srcDir}${sep}`) || !SOURCE_EXTENSION.test(path)) return undefined
          try {
            return { contents: await transpile(path, source), loader: 'js' }
          } catch (error) {
            // 실패를 모으고 계속 간다. 깨진 파일이 여럿이면 한 번에 다 보인다
            errors.push(babelError(options.cwd, path, error))
            return { contents: '', loader: 'js' }
          }
        })
      },
    })

    const common: BuildOptions = {
      absWorkingDir: options.cwd,
      bundle: true,
      format: 'cjs',
      platform: 'node',
      target: ['es2015'],
      // build 레인과 같다. RN 코드가 짚는 `global` 을 런타임마다 갈리지 않게 고정한다
      define: { global: 'globalThis' },
      // Hermes 는 `import()` 를 못 읽는다. build 레인은 번들이 접어 주지만 여기는 import 를 밖에 둬서 남는다
      supported: { 'dynamic-import': false },
      logLevel: 'silent',
    }

    let files: string[]
    try {
      const graph = await esbuild.build({
        ...common,
        write: false,
        entryPoints: [resolve(srcDir, options.entry)],
        metafile: true,
        plugins: [modulesPlugin(false)],
      })
      files = Object.keys(graph.metafile?.inputs ?? {}).map((input) => resolve(options.cwd, input))
    } catch (error) {
      return { ok: false, errors: [...errors, ...buildErrors(error)] }
    }
    if (errors.length > 0) return { ok: false, errors }

    const modules = new Map<ModuleId, ModuleBuild>()
    try {
      const linked = await esbuild.build({
        ...common,
        write: false,
        entryPoints: files.map((path, index) => ({ in: path, out: String(index) })),
        outdir: LINK_OUTDIR,
        plugins: [modulesPlugin(true)],
      })
      const outputs = new Map(linked.outputFiles.map((output) => [output.path, output.text]))
      files.forEach((path, index) => {
        const code = outputs.get(join(options.cwd, LINK_OUTDIR, `${index}.js`))
        if (code === undefined) {
          errors.push({
            file: relative(options.cwd, path),
            message: 'esbuild 가 모듈을 내지 않았다',
          })
        } else {
          modules.set(toModuleId(srcDir, path), { source: sources.get(path) ?? '', code })
        }
      })
      if (errors.length > 0) return { ok: false, errors }

      const shared = JSON.stringify(options.shared)
      if (vendor?.shared !== shared) {
        vendor = { shared, chunks: [], chunkOf: new Map(), specAt: new Map() }
      }
      const { chunkOf } = vendor
      const fresh = [...vendorSpecs].filter((spec) => !chunkOf.has(spec)).sort()
      if (fresh.length > 0) await bundleVendor(vendor, fresh)
      for (const chunk of vendor.chunks) {
        for (const spec of chunk.requires) requires.add(spec)
        modules.set(chunk.id, { source: chunk.source, code: chunk.code })
      }
      for (const [spec, chunk] of chunkOf) {
        const code = `module.exports = require(${JSON.stringify(chunk)})[${JSON.stringify(spec)}];\n`
        modules.set(`${VENDOR}${spec}`, { source: code, code })
      }
    } catch (error) {
      return { ok: false, errors: [...errors, ...buildErrors(error)] }
    }

    if (options.blockScoping) {
      for (const [id, module] of modules) {
        const known = scoped.get(id)
        const output = known?.input === module.code ? known.output : stripBlockScoping(module.code)
        scoped.set(id, { input: module.code, output })
        modules.set(id, { ...module, code: await output })
      }
    }

    return { ok: true, modules, requires: [...requires].sort() }

    /**
     * 처음 보는 bare 패키지를 새 청크 하나로 묶어 `vendor` 에 더한다. 패키지가 shared 를 import 하면 그
     * 자리는 밖에 둔다 — 런타임의 `require` 가 호스트 사본을 준다. 이미 실린 파일에 닿아도 밖에 두고 그
     * spec 의 모듈을 부른다 — 실린 인스턴스를 같이 쓴다. 파일로 맞추므로 안에 다른 버전을 품은 패키지는
     * 그 버전을 묶는다. 서드파티라 `"use strict"` 를 붙이지 않는다.
     */
    async function bundleVendor(vendor: Vendor, specs: string[]) {
      const id: ModuleId = `${VENDOR}/${chunkCount++}`
      const source = `module.exports = {\n${specs.map((spec) => `  ${JSON.stringify(spec)}: require(${JSON.stringify(spec)}),`).join('\n')}\n}\n`
      const vendorRequires = new Set<string>()
      const exported = new Map<string, string>()
      const result = await esbuild.build({
        ...common,
        write: false,
        stdin: { contents: source, resolveDir: srcDir, sourcefile: id, loader: 'js' },
        plugins: [
          {
            name: 'react-native-mf/dev-vendor',
            setup(build) {
              build.onResolve({ filter: /^[^./]/ }, async (args) => {
                if (args.pluginData === RESOLVING) return undefined
                if (isShared.test(args.path)) {
                  vendorRequires.add(args.path)
                  return { path: args.path, external: true }
                }
                const { path } = await build.resolve(args.path, {
                  kind: args.kind,
                  importer: args.importer,
                  resolveDir: args.resolveDir,
                  pluginData: RESOLVING,
                })
                const loaded = vendor.specAt.get(path)
                if (loaded !== undefined) return { path: `${VENDOR}${loaded}`, external: true }
                // src 에서 푸는 것은 이 청크가 내보내는 spec 뿐이다
                if (args.resolveDir === srcDir) exported.set(path, args.path)
                return undefined
              })
            },
          },
        ],
      })
      const [output] = result.outputFiles
      if (!output) throw new Error('[react-native-mf] esbuild 가 의존 청크를 내지 않았다.')
      vendor.chunks.push({ id, source, code: output.text, requires: [...vendorRequires] })
      for (const spec of specs) vendor.chunkOf.set(spec, id)
      for (const [path, spec] of exported) vendor.specAt.set(path, spec)
    }
  }
}

/**
 * react-refresh/babel 을 미니앱의 `react-native` 옆에서 찾는다. 호스트에 `__ReactRefresh` 를 거는
 * 것도 `react-native` 가 의존으로 까는 react-refresh 다. 거기 없으면 미니앱에서 찾는다.
 */
function resolveRefreshPlugin(cwd: string): string {
  const fromApp = createRequire(join(cwd, 'package.json'))
  const reactNative = tryResolve(fromApp, 'react-native/package.json')
  const plugin =
    (reactNative && tryResolve(createRequire(reactNative), 'react-refresh/babel')) ??
    tryResolve(fromApp, 'react-refresh/babel')
  if (!plugin) {
    throw new Error(
      '[react-native-mf] react-refresh 를 찾을 수 없다. react-native 가 함께 까는 패키지다 — 미니앱에 react-native 를 설치한다.',
    )
  }
  return plugin
}

function tryResolve(require: NodeJS.Require, spec: string): string | undefined {
  try {
    return require.resolve(spec)
  } catch {
    return undefined
  }
}

/** babel 메시지는 절대 경로로 시작한다. `file` 이 따로 있으니 떼어낸다 */
function babelError(cwd: string, path: string, error: unknown): PassError {
  const message = error instanceof Error ? error.message : String(error)
  const prefix = `${path}: `
  return {
    file: relative(cwd, path),
    message: message.startsWith(prefix) ? message.slice(prefix.length) : message,
  }
}

function buildErrors(error: unknown): PassError[] {
  if (!(error instanceof Error && 'errors' in error && Array.isArray(error.errors))) throw error
  return (error.errors as Message[]).map(({ location, text }) => ({
    file: location?.file ?? '',
    message: text,
  }))
}

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
