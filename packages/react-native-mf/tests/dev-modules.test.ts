/**
 * dev 모듈 컴파일러. 진짜 babel · esbuild · react-refresh/babel 로 임시 미니앱을 굽고, 구운 번들을
 * 빈 vm realm 에서 부팅해 호스트가 보는 것을 본다.
 *
 * 임시 프로젝트는 `cli-build.test.ts` 와 같은 자리 규칙이다 — 패키지 안이어야 babel 프리셋과
 * react-refresh 를 찾고, `node_modules` 아래면 esbuild 가 `"use strict"` 를 빼서 strict 판정이 흐려진다.
 */
import assert from 'node:assert/strict'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import type { CompileOptions } from '../src/cli/build-options'
import {
  buildRuntime,
  bundleText,
  createModuleCompiler,
  entryId,
  type PassResult,
} from '../src/cli/dev/modules'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = join(here, '../.tmp-dev-modules-test')

/** 픽스처 config 의 플러그인이 babel 이 돈 파일을 여기 적는다 */
const babelRuns: string[] = []
;(globalThis as { __devModulesBabelRuns?: string[] }).__devModulesBabelRuns = babelRuns

async function write(relativePath: string, contents: string): Promise<void> {
  const target = join(projectDir, relativePath)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, contents)
}

const countPlugin = JSON.stringify(join(projectDir, 'count-plugin.cjs'))

before(async () => {
  await rm(projectDir, { recursive: true, force: true })
  await write(
    'count-plugin.cjs',
    'module.exports = () => ({ visitor: { Program(_, state) { globalThis.__devModulesBabelRuns.push(state.filename) } } })\n',
  )
  await write(
    'babel.config.cjs',
    `module.exports = { presets: ['@babel/preset-typescript'], plugins: [${countPlugin}] }\n`,
  )
  // Metro 설정을 베낀 미니앱이 react-refresh/babel 을 직접 적은 모양이다
  await write(
    'babel.refresh.cjs',
    "module.exports = { presets: ['@babel/preset-typescript'], plugins: ['react-refresh/babel'] }\n",
  )
  // package.json 이 없으면 위로 올라가 이 패키지의 `"type": "module"` 을 읽고 ESM 으로 본다
  await write('node_modules/tiny-vendor/package.json', '{ "name": "tiny-vendor" }\n')
  await write(
    'node_modules/tiny-vendor/index.js',
    "const native = require('react-native')\nmodule.exports = { tag: (n) => 'vendor:' + native.marker + ':' + n }\n",
  )

  await write(
    'src/index.ts',
    [
      "import { helper, sloppy } from './helper'",
      "import { Screen } from './screen'",
      '',
      'export default { Screen, helper, sloppy }',
      '',
    ].join('\n'),
  )
  await write('src/screen/index.ts', "export { Screen } from './screen'\n")
  await write(
    'src/screen/screen.ts',
    [
      "import { useState } from 'react'",
      '',
      'export function Screen(): number {',
      '  const [count] = useState(0)',
      '  return count',
      '}',
      '',
    ].join('\n'),
  )
  await write(
    'src/helper.ts',
    [
      "import { tag } from 'tiny-vendor'",
      '',
      'export function helper(count: number): string {',
      '  const parts: string[] = []',
      '  for (let index = 0; index < count; index += 1) parts.push(tag(index))',
      "  return parts.join(',')",
      '}',
      '',
      'export const sloppy = (function (this: unknown) {',
      '  return this !== undefined',
      '})()',
      '',
    ].join('\n'),
  )
  // 엔트리에서 닿지 않는다. 안 깐 패키지를 불러도 굽기가 깨지지 않아야 한다
  await write('src/__tests__/unreached.test.ts', "import 'not-installed-anywhere'\n")
})

after(() => rm(projectDir, { recursive: true, force: true }))

function options(overrides: Partial<CompileOptions> = {}): CompileOptions {
  return {
    cwd: projectDir,
    src: 'src',
    entry: 'index.ts',
    name: 'settings',
    shared: ['react', 'react-native'],
    babelConfig: join(projectDir, 'babel.config.cjs'),
    blockScoping: true,
    ...overrides,
  }
}

function compiled(result: PassResult) {
  if (!result.ok) assert.fail(`굽기가 실패했다: ${JSON.stringify(result.errors)}`)
  return result
}

/** 호스트가 하는 그대로 — shared 를 깔고, 번들을 돌리고, 레지스트리에서 꺼낸다 */
async function boot(result: PassResult, compileOptions: CompileOptions) {
  const { modules, requires } = compiled(result)
  const registered: string[] = []
  const realm = vm.createContext({
    console,
    // 부팅 뒤 hot 요청을 건다. 이 테스트는 받지 않는다
    fetch: () => new Promise(() => {}),
    [SHARED_SCOPE_KEY]: {
      react: { useState: (value: unknown) => [value] },
      'react-native': { marker: 'HOST_RN' },
    },
    __ReactRefresh: {
      register: (_type: unknown, id: string) => registered.push(id),
      createSignatureFunctionForTransform: () => (type: unknown) => type,
    },
  })
  const text = bundleText(
    {
      name: compileOptions.name,
      entry: entryId(compileOptions),
      modules: [...modules].map(([id, { code }]) => [id, code] as const),
      requires: [...requires],
      stamp: { epoch: 'e', version: 1 },
      sourceRoot: 'http://localhost:8082/settings/',
      hotUrl: 'http://localhost:8082/settings/hot',
      keys: { registry: REMOTE_REGISTRY_KEY, shared: SHARED_SCOPE_KEY },
    },
    await buildRuntime({ blockScoping: compileOptions.blockScoping }),
  )
  vm.runInContext(text, realm)
  const remote = vm.runInContext(
    `globalThis[${JSON.stringify(REMOTE_REGISTRY_KEY)}].settings`,
    realm,
  )
  return { remote: remote.default, registered }
}

test('엔트리에서 닿는 파일만 src 기준 경로로 모듈이 되고, bare import 는 의존 청크로 간다', async () => {
  const result = compiled(await createModuleCompiler(async () => options())())

  assert.deepEqual([...result.modules.keys()].sort(), [
    './helper.ts',
    './index.ts',
    './screen/index.ts',
    './screen/screen.ts',
    'vendor:',
    'vendor:tiny-vendor',
  ])
  assert.deepEqual(
    result.requires,
    ['react', 'react-native'],
    '의존 청크만 읽는 react-native 도 requires 에 든다',
  )
})

test('구운 번들이 빈 realm 에서 부팅한다. 지역 · shared · 의존 청크가 다 풀리고 모듈은 strict 다', async () => {
  const { remote, registered } = await boot(
    await createModuleCompiler(async () => options())(),
    options(),
  )

  assert.equal(remote.helper(2), 'vendor:HOST_RN:0,vendor:HOST_RN:1')
  assert.equal(remote.Screen(), 0)
  assert.equal(remote.sloppy, false, '지역 모듈이 sloppy 로 돌았다')
  assert.deepEqual(registered, ['settings:./screen/screen.ts Screen'])
})

test('blockScoping 이면 어느 모듈에도 let · const 가 남지 않는다', async () => {
  const stripped = compiled(await createModuleCompiler(async () => options())())
  const raw = compiled(await createModuleCompiler(async () => options({ blockScoping: false }))())
  const letOrConst = /\b(?:let|const)\s/

  for (const [id, { code }] of stripped.modules) {
    assert.doesNotMatch(code, letOrConst, `${id} 에 let · const 가 남았다`)
  }
  assert.match(raw.modules.get('./helper.ts')?.code ?? '', letOrConst, '대조군에 let 이 없다')
})

test('글자가 그대로인 파일은 다시 babel 에 태우지 않는다', async () => {
  await write('reuse-src/index.ts', "export { a } from './a'\nexport { b } from './b'\n")
  await write('reuse-src/a.ts', 'export const a = 1\n')
  await write('reuse-src/b.ts', 'export const b = 1\n')
  const compile = createModuleCompiler(async () => options({ src: 'reuse-src' }))
  compiled(await compile())

  babelRuns.length = 0
  compiled(await compile())
  assert.deepEqual(babelRuns, [], '바뀐 게 없는데 babel 이 돌았다')

  await write('reuse-src/a.ts', 'export const a = 2\n')
  compiled(await compile())
  assert.deepEqual(babelRuns, [join(projectDir, 'reuse-src/a.ts')])
})

test('tsconfig paths 별칭으로 연 src 파일은 지역 모듈이다. 고치면 다음 굽기가 새 글자를 싣는다', async () => {
  await write(
    'alias-app/tsconfig.json',
    '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }\n',
  )
  await write(
    'alias-app/src/index.ts',
    [
      "import { util } from '@/lib/util'",
      "import { util as byPath } from './lib/util'",
      '',
      'export default { version: util.version, same: util === byPath }',
      '',
    ].join('\n'),
  )
  await write('alias-app/src/lib/util.ts', 'export const util = { version: 1 }\n')
  const aliasOptions = options({ src: 'alias-app/src' })
  const compile = createModuleCompiler(async () => aliasOptions)
  compiled(await compile())

  await write('alias-app/src/lib/util.ts', 'export const util = { version: 2 }\n')
  const result = await compile()

  assert.ok(compiled(result).modules.has('./lib/util.ts'))
  const { remote } = await boot(result, aliasOptions)
  assert.deepEqual({ ...remote }, { version: 2, same: true })
})

test('깨진 파일과 못 푸는 import 를 한 번에 파일마다 다 적는다', async () => {
  await write('broken-src/index.ts', "import './a'\nimport './b'\n")
  await write('broken-src/a.ts', 'export const a = (\n')
  await write('broken-src/b.ts', "import { gone } from './deleted'\nexport const b = gone\n")

  const result = await createModuleCompiler(async () => options({ src: 'broken-src' }))()

  assert.ok(!result.ok)
  assert.deepEqual(result.errors.map(({ file }) => file).sort(), [
    'broken-src/a.ts',
    'broken-src/b.ts',
  ])
  const byFile = new Map(result.errors.map(({ file, message }) => [file, message]))
  assert.match(byFile.get('broken-src/a.ts') ?? '', /Unexpected token|SyntaxError/)
  assert.equal(byFile.get('broken-src/b.ts'), 'Could not resolve "./deleted"')
})

test('import() 를 쓴 모듈도 빈 realm 에서 풀린다. 지역 · 의존 청크 · shared · 의존 청크 안의 import() 다', async () => {
  await write('node_modules/lazy-vendor/package.json', '{ "name": "lazy-vendor" }\n')
  await write(
    'node_modules/lazy-vendor/index.js',
    "exports.native = () => import('react-native').then((native) => native.marker)\n",
  )
  await write(
    'lazy-src/index.ts',
    [
      'export default {',
      "  local: () => import('./lazy').then((lazy) => lazy.value),",
      "  vendor: () => import('tiny-vendor').then((vendor) => vendor.tag(7)),",
      "  shared: () => import('react-native').then((native) => native.marker),",
      "  inVendor: () => import('lazy-vendor').then((vendor) => vendor.native()),",
      '}',
      '',
    ].join('\n'),
  )
  await write('lazy-src/lazy.ts', 'export const value = 42\n')
  const lazyOptions = options({ src: 'lazy-src' })
  const result = await createModuleCompiler(async () => lazyOptions)()

  // Hermes 는 import() 를 못 읽는다. 빈 realm 도 import() 를 받을 길이 없어 거절한다
  for (const [id, { code }] of compiled(result).modules) {
    assert.doesNotMatch(code, /\bimport\(/, `${id} 에 import() 가 남았다`)
  }
  const { remote } = await boot(result, lazyOptions)
  assert.deepEqual(
    await Promise.all([remote.local(), remote.vendor(), remote.shared(), remote.inVendor()]),
    [42, 'vendor:HOST_RN:7', 'HOST_RN', 'HOST_RN'],
  )
})

test('미니앱 config 가 react-refresh/babel 을 이미 들고 있어도 컴포넌트를 한 번만 등록한다', async () => {
  const withRefresh = options({ babelConfig: join(projectDir, 'babel.refresh.cjs') })
  const { registered } = await boot(
    await createModuleCompiler(async () => withRefresh)(),
    withRefresh,
  )

  assert.deepEqual(registered, ['settings:./screen/screen.ts Screen'])
})
