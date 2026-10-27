/**
 * dev 번들의 기기 런타임. **발행본(`dist/dev-runtime.js`)을 서버와 같은 한 걸음으로 묶은 글자**를
 * 빈 vm realm 에서 돌린다. Node 전역도 tsx 헬퍼도 없는 자리라 바깥 참조가 하나라도 남으면 여기서 터진다.
 * `turbo test` 가 build 뒤에 돌아서 dist 가 있다.
 *
 * 호스트가 보는 것만 본다 — 레지스트리 칸, 던지는 에러, `__ReactRefresh` 에 들어간 id, 경고 · fetch 횟수.
 */
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { buildRuntime, bundleText } from '../src/cli/dev/modules'
import type { ModuleSource } from '../src/cli/dev/wire'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const distRuntime = join(dirname(fileURLToPath(import.meta.url)), '../dist/dev-runtime.js')
let runtime = ''

before(async () => {
  runtime = await buildRuntime({ blockScoping: true, input: distRuntime })
})

type Options = { requires?: string[]; refresh?: boolean }

/** 호스트 한 벌. 첫 모듈이 엔트리다 */
function host(modules: ModuleSource[], { requires = [], refresh = true }: Options = {}) {
  const registered: string[] = []
  const warnings: string[] = []
  const fetches: string[] = []
  const realm = vm.createContext({
    console: { warn: (line: string) => warnings.push(line) },
    fetch: (url: string) => {
      fetches.push(url)
      return new Promise(() => {})
    },
    [SHARED_SCOPE_KEY]: { react: { marker: 'HOST_REACT' } },
    // Metro 의 require 폴리필이 거는 전역 no-op. 모듈이 이걸 잡으면 등록이 조용히 사라진다
    $RefreshReg$: () => registered.push('전역 $RefreshReg$'),
    ...(refresh && {
      __ReactRefresh: {
        register: (_type: unknown, id: string) => registered.push(id),
        createSignatureFunctionForTransform: () => (type: unknown) => type,
      },
    }),
  })

  const boot = () =>
    vm.runInContext(
      bundleText(
        {
          name: 'settings',
          entry: modules[0][0],
          modules,
          requires,
          stamp: { epoch: 'e', version: 1 },
          sourceRoot: 'http://localhost:8082/settings/',
          hotUrl: 'http://localhost:8082/settings/hot',
          keys: { registry: REMOTE_REGISTRY_KEY, shared: SHARED_SCOPE_KEY },
        },
        runtime,
      ),
      realm,
    )
  const remote = () => vm.runInContext(`globalThis[${JSON.stringify(REMOTE_REGISTRY_KEY)}]`, realm)
  const global = (name: string) => vm.runInContext(`globalThis.${name}`, realm)

  return { boot, remote, global, registered, warnings, fetches }
}

test('엔트리의 exports 가 레지스트리 칸에 오른다. 지역 모듈과 shared 를 다 푼다', () => {
  const remote = host(
    [
      [
        './index.ts',
        '"use strict"; var a = require("./a.ts"); module.exports = { label: a.label, react: require("react").marker, once: require("./once.ts").count };',
      ],
      ['./a.ts', '"use strict"; require("./once.ts"); exports.label = "from a";'],
      [
        './once.ts',
        '"use strict"; globalThis.runs = (globalThis.runs || 0) + 1; exports.count = globalThis.runs;',
      ],
    ],
    { requires: ['react'] },
  )

  remote.boot()

  assert.deepEqual(
    { ...remote.remote().settings },
    { label: 'from a', react: 'HOST_REACT', once: 1 },
  )
  assert.equal(remote.global('runs'), 1, '둘이 require 한 모듈이 두 번 돌았다')
})

test('컴포넌트는 `원격이름:모듈 지역이름` 으로 등록하고 Metro 의 전역 no-op 을 잡지 않는다', () => {
  const remote = host([
    [
      './screen.tsx',
      '"use strict"; function Screen() {} var _c = Screen; $RefreshReg$(_c, "Screen"); exports.default = Screen;',
    ],
  ])

  remote.boot()

  assert.deepEqual(remote.registered, ['settings:./screen.tsx Screen'])
})

test('빠진 shared 키를 한꺼번에 이름 대고, 모듈은 하나도 돌리지 않는다', () => {
  const remote = host([['./index.ts', '"use strict"; globalThis.ran = true;']], {
    requires: ['react', 'react-native', '@tanstack/react-query'],
  })

  assert.throws(
    remote.boot,
    /shared 모듈 "react-native", "@tanstack\/react-query" 이 등록돼 있지 않다/,
  )
  assert.equal(remote.global('ran'), undefined)
})

test('__ReactRefresh 가 없는 호스트에선 등록 없이 돌고, 한 번 경고하고, 서버를 부르지 않는다', () => {
  const remote = host(
    [
      [
        './screen.tsx',
        '"use strict"; var _s = $RefreshSig$(); function Screen() { _s(); } _s(Screen, "useState{}"); $RefreshReg$(Screen, "Screen"); exports.default = Screen;',
      ],
    ],
    { refresh: false },
  )

  remote.boot()

  assert.equal(typeof remote.remote().settings.default, 'function')
  assert.deepEqual(remote.registered, [])
  assert.equal(remote.warnings.length, 1)
  assert.match(remote.warnings[0], /"settings" dev 번들이 Fast Refresh 없는 호스트에서 돈다/)
  assert.deepEqual(remote.fetches, [])
})

test('던진 모듈은 부팅을 실패시키고 레지스트리를 비워 둔다. 스택은 모듈 주소를 가리킨다', () => {
  const remote = host([
    ['./index.ts', '"use strict"; require("./boom.ts");'],
    ['./boom.ts', '"use strict"; throw new Error("boom");'],
  ])

  assert.throws(remote.boot, (error: Error) => {
    assert.equal(error.message, 'boom')
    assert.match(error.stack ?? '', /http:\/\/localhost:8082\/settings\/boom\.ts/)
    return true
  })
  assert.equal(remote.remote()?.settings, undefined)
})

test('순환 import 는 도는 중인 모듈이 바꿔 낀 exports 를 받는다', () => {
  // esbuild 의 CJS 가 하는 그대로다 — 맨 위에서 `module.exports` 를 바꾸고 그 뒤에 require 한다
  const remote = host([
    [
      './a.ts',
      '"use strict"; module.exports = { name: "a" }; module.exports.seenByB = require("./b.ts").seen;',
    ],
    ['./b.ts', '"use strict"; exports.seen = require("./a.ts").name;'],
  ])

  remote.boot()

  assert.deepEqual({ ...remote.remote().settings }, { name: 'a', seenByB: 'a' })
})
