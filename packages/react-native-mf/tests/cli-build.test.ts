/**
 * `build` 산출물 검증 — 실제로 미니앱 하나를 구워서 `vm` 에 태운다.
 *
 * 고정하는 것은 셋이다. **shared 치환이 걸렸는가** · **footer 가 스스로 등록하는가** ·
 * **block-scoping 후처리가 실제로 `let` 을 걷어냈는가.** 셋 다 타입도 빌드도 못 잡고,
 * 깨지면 로드 시점이나 런타임에서야 드러난다.
 *
 * 임시 프로젝트 자리는 두 조건을 **동시에** 만족해야 한다. 패키지 **안**이어야 하고 — babel 이
 * config 의 preset 을 위로 올라가며 찾고 esbuild 도 bare import 를 같은 방식으로 찾는다,
 * 레포 밖(`os.tmpdir()`)에 세우면 둘 다 아무것도 못 찾는다 — 그러면서 **`node_modules` 아래면
 * 안 된다.** esbuild 가 그 경로를 서드파티로 보고 `"use strict"` 를 빼기 때문에, 픽스처를
 * 거기 두면 아래 strict 테스트가 원인을 못 가린다. `tsconfig` 의 `include` 가 `src`·`tests`
 * 뿐이라 tsc 시야 밖인 건 그대로다.
 */
import assert from 'node:assert/strict'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { compileBundle, runBuild, TRANSPILE_ROOT } from '../src/cli/build'
import { type BuildOptions, resolveConfigBuild } from '../src/cli/build-options'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = join(here, '../.tmp-cli-test')

/** 호스트가 노출하는 사본 자리. 값이 그대로 원격 번들에 도달하는지 보는 표식이다. */
const hostScope = {
  react: { useState: 'HOST_REACT_useState' },
  'react-native': { View: 'HOST_RN_View' },
}

async function write(relativePath: string, contents: string): Promise<void> {
  const target = join(projectDir, relativePath)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, contents)
}

await rm(projectDir, { recursive: true, force: true })

// 미니앱의 babel config. **이 패키지가 아니라 미니앱이 든다** — RN 프리셋은 미니앱의 사실이다.
await write('babel.config.cjs', "module.exports = { presets: ['@babel/preset-typescript'] }\n")
// 같은 자리에 프리셋이 없는 config 도 둔다. `--babel-config` 가 실제로 먹는지 보는 대조군이다.
await write('babel.empty.cjs', 'module.exports = {}\n')

await write('src/helper.ts', "export const suffix: string = '!'\n")
await write(
  'src/index.ts',
  [
    "import { useState } from 'react'",
    "import { View } from 'react-native'",
    "import { suffix } from './helper'",
    '',
    'type Used = { useState: unknown; View: unknown; label: string }',
    '',
    'export default function MiniApp(label: string): Used {',
    '  const parts: string[] = []',
    '  for (let index = 0; index < 1; index += 1) {',
    '    parts.push(label + index + suffix)',
    '  }',
    '  return { useState, View, label: parts.join("") }',
    '}',
    '',
  ].join('\n'),
)

after(() => rm(projectDir, { recursive: true, force: true }))

function options(overrides: Partial<BuildOptions> = {}): BuildOptions {
  return {
    cwd: projectDir,
    src: 'src',
    entry: 'index.ts',
    outFile: 'build/index.bundle.js',
    name: 'settings',
    shared: ['react', 'react-native'],
    blockScoping: true,
    ...overrides,
  }
}

type MiniApp = { default: (label: string) => Record<string, unknown> }

/** 번들을 호스트가 하는 그대로 돌린다 — shared 를 먼저 깔고, 소스를 실행하고, 회수한다. */
function runInVm(code: string): Record<string, MiniApp> {
  const context = vm.createContext({})

  vm.runInContext(`globalThis[${JSON.stringify(SHARED_SCOPE_KEY)}] = {}`, context)
  const registered = vm.runInContext(
    `globalThis[${JSON.stringify(SHARED_SCOPE_KEY)}]`,
    context,
  ) as Record<string, unknown>
  Object.assign(registered, hostScope)

  vm.runInContext(code, context)

  return vm.runInContext(`globalThis[${JSON.stringify(REMOTE_REGISTRY_KEY)}]`, context) as Record<
    string,
    MiniApp
  >
}

test('구운 번들이 self-register 와 shared 치환을 담는다', async (t) => {
  const { outFile, bytes } = await runBuild(options())
  const code = await readFile(outFile, 'utf8')

  assert.ok(bytes > 0, '빈 산출물이 나왔다')
  assert.ok(!/require\(\s*["']react["']\s*\)/.test(code), 'require("react") 가 남아 있다')
  assert.match(code, new RegExp(SHARED_SCOPE_KEY), 'shared 치환이 안 걸렸다')
  assert.match(code, new RegExp(REMOTE_REGISTRY_KEY), 'self-register footer 가 없다')

  const remotes = runInVm(code)
  assert.deepEqual(Object.keys(remotes), ['settings'])

  // 호스트 사본이 미니앱 안까지 그대로 닿는가. `suffix` 는 소스 트리가 통째로
  // transpile 됐다는 증거다 — 엔트리 하나만 구웠으면 여기서 못 푼다.
  const used = remotes.settings.default('a')
  assert.equal(used.useState, 'HOST_REACT_useState')
  assert.equal(used.View, 'HOST_RN_View')
  assert.equal(used.label, 'a0!')

  t.diagnostic(`bundle ${bytes} bytes`)
})

test('산출물이 strict 모드다 — 중간 산출물을 node_modules 아래 두면 조용히 깨진다', async () => {
  // 소스는 ESM 이고 ESM 은 명세상 strict 인데, 원격 번들은 `new Function` 으로 실행되므로
  // 지시어가 없으면 sloppy 로 돈다 — 선언 안 한 변수 할당이 전역을 만들고 함수 안 `this` 가
  // `globalThis` 가 된다. esbuild 는 엔트리가 `node_modules/` 아래면 이 지시어를 안 붙인다.
  // 실측(0.25.7): `build/.probe` → `"use strict";` · `node_modules/.cache/probe` → 없음.
  const { outFile } = await runBuild(options({ outFile: 'build/strict.js' }))
  const code = await readFile(outFile, 'utf8')

  assert.match(code.split('\n')[0], /^"use strict";$/, '최상위 "use strict" 가 사라졌다')
  for (const [lane, root] of Object.entries(TRANSPILE_ROOT)) {
    assert.ok(!root.includes('node_modules'), `${lane} 레인 중간 산출물이 node_modules 아래다`)
  }
})

test('dev 레인 굽기는 build 레인 중간 산출물도 outFile 도 건드리지 않는다', async () => {
  // dev 가 떠 있는 채로 deploy 하면 두 굽기가 겹친다. transpile 은 rm 부터 하므로 자리가 같으면
  // 한쪽이 다른 쪽 중간 산출물을 지운다.
  await runBuild(options({ outFile: 'build/lane.js' }))
  const sentinel = join(projectDir, TRANSPILE_ROOT.build, 'settings', 'sentinel.txt')
  await writeFile(sentinel, 'build 레인')

  const devOptions = options({ outFile: 'build/dev-never-written.js' })
  const { code } = await compileBundle(devOptions, 'dev')

  assert.equal(
    await readFile(sentinel, 'utf8'),
    'build 레인',
    'dev 굽기가 build 레인 자리를 지웠다',
  )
  await assert.rejects(
    stat(join(projectDir, devOptions.outFile)),
    /ENOENT/,
    'dev 굽기가 파일을 썼다',
  )
  assert.equal(runInVm(code).settings.default('a').label, 'a0!')
})

test('실패한 굽기는 남은 변환이 다 쓴 뒤에 던진다. 다음 굽기의 rm 과 겹치지 않는다', async () => {
  // dev 큐는 실패가 오면 바로 다음 굽기를 연다. 먼저 던지고 쓰기가 남으면 다음 굽기의
  // rm 이 ENOTEMPTY 로 터지고, 지운 소스의 산출물이 다음 굽기 자리에 남는다.
  await write('straggler-src/a.ts', 'export const a = (\n')
  await write('straggler-src/index.ts', "import { a } from './a'\nexport default () => a\n")
  const body = Array.from({ length: 50 }, (_, i) => `export const v${i}: number = ${i}`).join('\n')
  for (let i = 0; i < 60; i += 1) await write(`straggler-src/many/x${i}.ts`, body)

  const devDir = join(projectDir, TRANSPILE_ROOT.dev, 'settings')
  await assert.rejects(compileBundle(options({ src: 'straggler-src' }), 'dev'))
  const atRejection = await readdir(devDir, { recursive: true })
  await new Promise((settle) => setTimeout(settle, 300))

  assert.deepEqual(
    (await readdir(devDir, { recursive: true })).sort(),
    atRejection.sort(),
    '던진 뒤에도 transpile 자리에 썼다',
  )
})

test('block-scoping 후처리가 let 을 걷어낸다', async () => {
  // Hermes 런타임 컴파일러가 루프 안 `let` 을 반복마다 새 바인딩으로 안 만든다.
  // esbuild 의 `__copyProps` 가 정확히 그 모양이라 shared 모듈이 통째로 잘못 읽혔다.
  const stripped = await runBuild(options({ outFile: 'build/stripped.js' }))
  const raw = await runBuild(options({ outFile: 'build/raw.js', blockScoping: false }))

  assert.doesNotMatch(await readFile(stripped.outFile, 'utf8'), /\blet\s/)
  assert.match(await readFile(raw.outFile, 'utf8'), /\blet\s/, '대조군에 let 이 없다')
})

test('babel config 는 미니앱 것을 쓴다', async () => {
  // 프리셋이 없는 config 를 가리키면 TS 문법에서 파싱이 터진다. 조용히 지나가면
  // 미니앱의 worklet 변환이 빠진 번들이 나가는데, 그건 런타임에서야 드러난다.
  await assert.rejects(
    runBuild(options({ babelConfig: join(projectDir, 'babel.empty.cjs') })),
    /Unexpected token|Missing semicolon|SyntaxError/,
  )
})

test('config 의 babelConfig 는 미니앱 루트 기준 파일이다', async () => {
  // babel 에 그대로 넘기면 `babel.empty.cjs` 를 모듈 이름으로 찾다가 못 찾는다. 프리셋 없는 config 가
  // 실제로 읽혔다면 TS 문법에서 터진다
  const options = await resolveConfigBuild(
    { name: 'settings', build: { babelConfig: 'babel.empty.cjs', outFile: 'build/relative.js' } },
    projectDir,
  )

  await assert.rejects(runBuild(options), /Unexpected token|Missing semicolon|SyntaxError/)
})
