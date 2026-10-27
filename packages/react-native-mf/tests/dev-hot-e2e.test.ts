/**
 * hot 고리 전체. 진짜 dev 서버(`startDev`, 포트 0) · 진짜 컴파일러 · 발행본 런타임으로 구운 번들을 vm
 * realm 에서 호스트처럼 돌리고, Node `fetch` 로 hot 요청을 받는다. react-refresh 런타임도 같은 realm 에서
 * 돈다 — RN 이 `__ReactRefresh` 를 거는 자리와 같다. realm 이 다르면 `isLikelyComponentType` 이
 * `Object.prototype` 비교에서 함수 컴포넌트를 놓친다.
 *
 * 파일을 저장하고, 기기가 적용할 때까지 기다리고, react-refresh 가 본 것을 본다.
 */
import assert from 'node:assert/strict'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import type { CompileOptions } from '../src/cli/build-options'
import { buildRuntime, createModuleCompiler, entryId } from '../src/cli/dev/modules'
import { type DevServer, startDev } from '../src/cli/dev-command'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = join(here, '../.tmp-dev-hot-e2e-test')
const distRuntime = join(here, '../dist/dev-runtime.js')

async function write(relativePath: string, contents: string): Promise<void> {
  const target = join(projectDir, relativePath)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, contents)
}

const screen = (label: string) =>
  [
    "import { store } from './store'",
    '',
    'export function Screen(): string {',
    `  return '${label}:' + store.id`,
    '}',
    '',
  ].join('\n')

type Family = { current: () => string }
type RefreshRuntime = {
  register(type: unknown, id: string): void
  createSignatureFunctionForTransform(): unknown
  isLikelyComponentType(type: unknown): boolean
  getFamilyByType(type: unknown): Family | undefined
  performReactRefresh(): { updatedFamilies: Set<Family>; staleFamilies: Set<Family> } | null
}

/** RN 의 `setUpReactRefresh` 처럼 react-refresh 런타임을 realm 안에서 열고 `__ReactRefresh` 를 건다 */
async function installRefresh(realm: vm.Context) {
  const pkg = createRequire(import.meta.url).resolve('react-refresh/package.json')
  const path = join(dirname(pkg), 'cjs/react-refresh-runtime.development.js')
  const module = { exports: {} as RefreshRuntime }
  vm.runInContext(
    `(function (module, exports, process) {${await readFile(path, 'utf8')}\n})`,
    realm,
  )(module, module.exports, { env: { NODE_ENV: 'development' } })
  const runtime = module.exports
  const refreshed: ReturnType<RefreshRuntime['performReactRefresh']>[] = []
  const fullRefreshes: string[] = []
  realm.__ReactRefresh = {
    register: runtime.register,
    createSignatureFunctionForTransform: runtime.createSignatureFunctionForTransform,
    isLikelyComponentType: runtime.isLikelyComponentType,
    getFamilyByType: runtime.getFamilyByType,
    performReactRefresh: () => refreshed.push(runtime.performReactRefresh()),
    performFullRefresh: (reason: string) => fullRefreshes.push(reason),
  }
  return { runtime, refreshed, fullRefreshes }
}

async function until(condition: () => boolean, what: string) {
  const deadline = Date.now() + 10_000
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`10초를 기다려도 오지 않았다: ${what}`)
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
}

let server: DevServer
let stopped = false
const lines: string[] = []
const errors: unknown[][] = []
let hot: Awaited<ReturnType<typeof installRefresh>>
let realm: vm.Context
/** 부팅한 `Screen` 의 family. 저장할 때마다 `current` 가 새 함수로 바뀐다 */
let family: Family
let booted: () => string

before(async () => {
  await rm(projectDir, { recursive: true, force: true })
  await write('babel.config.cjs', "module.exports = { presets: ['@babel/preset-typescript'] }\n")
  await write(
    'src/index.ts',
    "import { Screen } from './screen'\n\nglobalThis.entries = (globalThis.entries ?? 0) + 1\n\nexport default Screen\n",
  )
  await write('src/screen.ts', screen('v1'))
  await write(
    'src/store.ts',
    'globalThis.stores = (globalThis.stores ?? 0) + 1\n\nexport const store = { id: globalThis.stores }\n',
  )

  const options: CompileOptions = {
    cwd: projectDir,
    src: 'src',
    entry: 'index.ts',
    name: 'settings',
    shared: ['react'],
    babelConfig: join(projectDir, 'babel.config.cjs'),
    blockScoping: true,
  }
  server = await startDev({
    name: 'settings',
    entry: entryId(options),
    srcDir: resolve(projectDir, 'src'),
    compile: createModuleCompiler(async () => options),
    runtime: () => buildRuntime({ blockScoping: true, input: distRuntime }),
    port: 0,
    log: (line) => lines.push(line),
  })

  // 테스트가 끝난 뒤의 hot 요청과 물러남은 아무 데도 닿지 않게 한다
  realm = vm.createContext({
    console: { warn: () => {}, error: (...args: unknown[]) => errors.push(args) },
    fetch: (url: string) => (stopped ? new Promise(() => {}) : fetch(url)),
    setTimeout: (callback: () => void, ms: number) => {
      if (!stopped) setTimeout(callback, ms)
    },
    [SHARED_SCOPE_KEY]: {},
  })
  hot = await installRefresh(realm)

  const bundle = await fetch(server.url)
  assert.equal(bundle.status, 200)
  vm.runInContext(await bundle.text(), realm)
  booted = vm.runInContext(
    `globalThis[${JSON.stringify(REMOTE_REGISTRY_KEY)}].settings`,
    realm,
  ).default
  const found = hot.runtime.getFamilyByType(booted)
  assert.ok(found, '부팅한 컴포넌트가 family 로 등록되지 않았다')
  family = found
})

after(async () => {
  stopped = true
  await server?.close()
  await rm(projectDir, { recursive: true, force: true })
})

test('컴포넌트 파일을 저장하면 리로드 없이 그 family 가 새 함수로 바뀌고, 싱글턴 모듈도 그 위 엔트리도 다시 돌지 않는다', async () => {
  assert.equal(family.current(), 'v1:1')

  await write('src/screen.ts', screen('v2'))
  await until(() => hot.refreshed.length > 0, '저장한 컴포넌트 적용')

  assert.deepEqual(hot.fullRefreshes, [])
  assert.deepEqual(errors, [])
  assert.ok(hot.refreshed[0]?.updatedFamilies.has(family), 'state 를 지키는 갱신이 아니다')
  assert.notEqual(family.current, booted)
  assert.equal(family.current(), 'v2:1')
  assert.equal(vm.runInContext('globalThis.stores', realm), 1, '싱글턴 모듈이 다시 돌았다')
  assert.equal(vm.runInContext('globalThis.entries', realm), 1, '모양이 같은데 경계 위로 넘겼다')
  assert.ok(
    lines.some((line) => /^hot v2 → localhost · 모듈 1개 · /.test(line)),
    lines.join('\n'),
  )
})

test('파일을 더하고 · 지우고 · 이름을 바꿔도 리로드 없이 갈아 끼운다', async () => {
  const importing = (from: string, name: string) =>
    [
      `import { ${name} } from './${from}'`,
      "import { store } from './store'",
      '',
      'export function Screen(): string {',
      `  return ${name}() + ':' + store.id`,
      '}',
      '',
    ].join('\n')
  const applied = (output: string) => until(() => family.current() === output, output)

  await write('src/badge.ts', "export function badge(): string {\n  return 'badge'\n}\n")
  await write('src/screen.ts', importing('badge', 'badge'))
  await applied('badge:1')

  await write('src/screen.ts', screen('v3'))
  await rm(join(projectDir, 'src/badge.ts'))
  await applied('v3:1')

  await write('src/label.ts', "export function label(): string {\n  return 'label'\n}\n")
  await write('src/screen.ts', importing('label', 'label'))
  await applied('label:1')
  await rename(join(projectDir, 'src/label.ts'), join(projectDir, 'src/tag.ts'))
  await write('src/screen.ts', importing('tag', 'label'))
  await applied('label:1')
  await until(
    () =>
      lines.some((line) => / · tag\.ts.*label\.ts 지움 · | · label\.ts 지움.*tag\.ts/.test(line)),
    'tag.ts 를 더하고 label.ts 를 지운 굽기',
  )

  assert.deepEqual(hot.fullRefreshes, [])
  assert.equal(vm.runInContext('globalThis.stores', realm), 1, '싱글턴 모듈이 다시 돌았다')
  assert.equal(vm.runInContext('globalThis.entries', realm), 1)
})
