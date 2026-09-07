/**
 * [2] · [3] 산출물 검증 — 네이티브 없이 도는 Phase 1 게이트.
 *
 * 번들을 실제로 만들어서 `vm` 컨텍스트에 태운다. 호스트 사본이 원격 번들에 도달하는지,
 * 실행된 번들이 스스로 레지스트리에 오르는지를 실행으로 확인한다.
 */
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import esbuild, { type BuildOptions } from 'esbuild'
import { sharedScopePlugin, withSelfRegister } from '../src/esbuild'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const here = dirname(fileURLToPath(import.meta.url))
const entry = join(here, 'fixtures/mini-app.js')

type MiniApp = { default: () => Record<string, unknown> }

/** 호스트가 노출하는 사본 자리. 값이 그대로 원격 번들에 도달하는지 확인하는 표식이다. */
const hostScope = {
  react: { useState: 'HOST_REACT_useState' },
  'react-native': { View: 'HOST_RN_View' },
}

async function bundle(options: BuildOptions = {}): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [sharedScopePlugin()],
    ...withSelfRegister({ name: 'settings' }),
    ...options,
  })

  // `write: false` 가 스프레드에 섞여 타입 narrowing 이 풀린다 — 산출물 유무를 여기서 본다.
  const [output] = result.outputFiles ?? []
  assert.ok(output, '번들 산출물이 없다')

  return output.text
}

function run(code: string, scope: Record<string, unknown> | null) {
  const context = vm.createContext({})

  if (scope) {
    vm.runInContext(`globalThis[${JSON.stringify(SHARED_SCOPE_KEY)}] = {}`, context)
    const registered = vm.runInContext(
      `globalThis[${JSON.stringify(SHARED_SCOPE_KEY)}]`,
      context,
    ) as Record<string, unknown>
    Object.assign(registered, scope)
  }

  vm.runInContext(code, context)

  return vm.runInContext(`globalThis[${JSON.stringify(REMOTE_REGISTRY_KEY)}]`, context) as Record<
    string,
    MiniApp
  >
}

test('shared 모듈이 번들에 들어가지 않는다', async () => {
  const code = await bundle()

  assert.ok(!/require\(\s*["']react["']\s*\)/.test(code), 'require("react") 가 남아 있다')
  assert.ok(
    !/require\(\s*["']react-native["']\s*\)/.test(code),
    'require("react-native") 가 남았다',
  )
  assert.match(code, new RegExp(SHARED_SCOPE_KEY))
})

test('self-register 가 원격 레지스트리에 올린다', async () => {
  const remotes = run(await bundle(), hostScope)

  assert.deepEqual(Object.keys(remotes), ['settings'])
  assert.equal(typeof remotes.settings.default, 'function')
})

test('원격 번들이 호스트 사본을 그대로 쓴다', async () => {
  const remotes = run(await bundle(), hostScope)

  // vm 컨텍스트가 다른 렐름이라 deepEqual 은 프로토타입에서 걸린다. 값만 본다.
  const used = remotes.settings.default()
  assert.equal(used.useState, 'HOST_REACT_useState')
  assert.equal(used.View, 'HOST_RN_View')
})

test('shared 가 등록돼 있지 않으면 로드 시점에 던진다', async () => {
  const code = await bundle()

  assert.throws(() => run(code, null), /shared 모듈 "react" 이 등록돼 있지 않다/)
})

test('카탈로그에 없는 모듈은 그대로 번들된다', async () => {
  const code = await bundle({
    entryPoints: undefined,
    stdin: {
      contents: "import { format } from 'not-shared-pkg'\nexport default format",
      resolveDir: here,
      loader: 'js',
    },
    external: ['not-shared-pkg'],
  })

  assert.match(code, /not-shared-pkg/)
})
