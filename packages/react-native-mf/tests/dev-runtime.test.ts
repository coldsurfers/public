/**
 * dev 번들의 기기 런타임. **발행본(`dist/dev-runtime.js`)을 서버와 같은 한 걸음으로 묶은 글자**를
 * 빈 vm realm 에서 돌린다. Node 전역도 tsx 헬퍼도 없는 자리라 바깥 참조가 하나라도 남으면 여기서 터진다.
 * `turbo test` 가 build 뒤에 돌아서 dist 가 있다.
 *
 * 호스트가 보는 것만 본다 — 레지스트리 칸, 던지는 에러, `__ReactRefresh` 에 들어간 id 와 부른 횟수,
 * 어느 모듈이 돌았는가, 경고 · fetch 주소 · 물러난 시간.
 */
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { buildRuntime, bundleText } from '../src/cli/dev/modules'
import type { ModuleId, ModuleSource, Reply } from '../src/cli/dev/wire'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

const distRuntime = join(dirname(fileURLToPath(import.meta.url)), '../dist/dev-runtime.js')
let runtime = ''

before(async () => {
  runtime = await buildRuntime({ blockScoping: true, input: distRuntime })
})

/** 서버가 hot 요청에 돌려줄 것. Promise 면 풀릴 때까지 붙든다. 다 쓰면 응답 없이 붙든다 */
type Scripted = Reply | 204 | 'reject' | Promise<Reply>

type Options = { requires?: string[]; refresh?: boolean; replies?: Scripted[] }

/** 호스트 한 벌. 첫 모듈이 엔트리다. `mod` 로 만든 모듈은 돌 때 `trace` 에 자기 id 를 남긴다 */
function host(
  modules: ModuleSource[],
  { requires = [], refresh = true, replies = [] }: Options = {},
) {
  const registered: string[] = []
  const types = new Map<string, unknown>()
  /** react-refresh 처럼 같은 id 로 등록한 함수는 같은 family 다. 여기선 id 가 곧 family 다 */
  const families = new Map<unknown, string>()
  const warnings: string[] = []
  const errors: unknown[][] = []
  const reported: unknown[] = []
  const fetches: string[] = []
  const timers: { callback: () => void; ms: number }[] = []
  const fullRefreshes: string[] = []
  const trace: string[] = []
  let refreshes = 0
  const realm = vm.createContext({
    console: {
      warn: (line: string) => warnings.push(line),
      error: (...args: unknown[]) => errors.push(args),
    },
    ErrorUtils: { reportError: (error: unknown) => reported.push(error) },
    fetch: (url: string) => {
      fetches.push(url)
      const next = replies.shift()
      if (next === undefined) return new Promise(() => {})
      if (next === 'reject') return Promise.reject(new TypeError('Network request failed'))
      if (next === 204) return Promise.resolve({ status: 204, json: () => Promise.reject() })
      return Promise.resolve(next).then((reply) => ({ status: 200, json: async () => reply }))
    },
    setTimeout: (callback: () => void, ms: number) => timers.push({ callback, ms }),
    trace,
    [SHARED_SCOPE_KEY]: { react: { marker: 'HOST_REACT' } },
    // Metro 의 require 폴리필이 거는 전역 no-op. 모듈이 이걸 잡으면 등록이 조용히 사라진다
    $RefreshReg$: () => registered.push('전역 $RefreshReg$'),
    ...(refresh && {
      __ReactRefresh: {
        register: (type: unknown, id: string) => {
          registered.push(id)
          types.set(id, type)
          families.set(type, id)
        },
        getFamilyByType: (type: unknown) => families.get(type),
        createSignatureFunctionForTransform: () => (type: unknown) => type,
        isLikelyComponentType: (type: unknown) =>
          typeof type === 'function' && /^[A-Z]/.test(type.name),
        performReactRefresh: () => {
          refreshes += 1
        },
        performFullRefresh: (reason: string) => fullRefreshes.push(reason),
      },
    }),
  })

  const boot = () =>
    vm.runInContext(
      bundleText(
        {
          name: 'settings',
          entry: modules[0][0],
          stamp: { epoch: 'e', version: 1 },
          modules,
          requires,
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
  /** react-refresh 가 그 id 로 그릴 컴포넌트 — 마지막으로 등록된 것 */
  const latest = (id: string) => types.get(`settings:${id}`) as () => unknown
  /** 앞선 hot 응답을 다 처리하고 n 번째 요청을 걸 때까지 */
  const polled = (n: number) => until(() => fetches.length >= n, `hot 요청 ${n} 번째`)

  return {
    realm,
    boot,
    remote,
    global,
    latest,
    polled,
    registered,
    warnings,
    errors,
    reported,
    fetches,
    timers,
    fullRefreshes,
    trace,
    refreshes: () => refreshes,
  }
}

async function until(condition: () => boolean, what: string) {
  const deadline = Date.now() + 2000
  while (!condition()) {
    if (Date.now() > deadline) throw new Error(`2초를 기다려도 오지 않았다: ${what}`)
    await new Promise((resolve) => setTimeout(resolve, 1))
  }
}

const update = (
  version: number,
  modules: ModuleSource[],
  removed: ModuleId[] = [],
  requires: string[] = [],
): Reply => ({
  kind: 'update',
  stamp: { epoch: 'e', version },
  modules,
  removed,
  requires,
})

/** 돌 때 `trace` 에 id 를 남기는 모듈 */
const mod = (id: ModuleId, body: string): ModuleSource => [
  id,
  `"use strict"; trace.push(${JSON.stringify(id)}); ${body}`,
]
const component = (id: ModuleId, name: string, body: string, rest = ''): ModuleSource =>
  mod(
    id,
    `${rest} function ${name}() { ${body} } $RefreshReg$(${name}, "${name}"); exports.${name} = ${name};`,
  )

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

/** 엔트리 → 화면(경계) → api(유틸, 싱글턴) · store(형제 싱글턴) */
const app = (api = 'v1'): ModuleSource[] => [
  mod('./index.ts', 'exports.default = require("./screen.tsx").Screen;'),
  component(
    './screen.tsx',
    'Screen',
    'return api.label + "/" + store.id;',
    'var api = require("./api.ts").api; var store = require("./store.ts").store;',
  ),
  mod(
    './api.ts',
    `globalThis.apis = (globalThis.apis || 0) + 1; exports.api = { label: "${api}" };`,
  ),
  mod('./store.ts', 'globalThis.stores = (globalThis.stores || 0) + 1; exports.store = { id: 1 };'),
]

test('hot 요청은 부팅한 상태를 커서로 들고 가고, 적용한 뒤엔 받은 상태로 옮긴다', async () => {
  const remote = host(app(), {
    replies: [update(2, [component('./screen.tsx', 'Screen', 'return "v2";')])],
  })

  remote.boot()
  await remote.polled(2)

  assert.deepEqual(remote.fetches, [
    'http://localhost:8082/settings/hot?have=e.1&seen=e.1',
    'http://localhost:8082/settings/hot?have=e.2&seen=e.2',
  ])
})

test('컴포넌트 모듈만 고치면 그 모듈 하나만 돌고 refresh 를 한 번 부른다', async () => {
  const remote = host(app(), {
    replies: [update(2, [component('./screen.tsx', 'Screen', 'return "v2";')])],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./screen.tsx'])
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v2')
  assert.equal(remote.refreshes(), 1)
  assert.deepEqual(remote.fullRefreshes, [])
})

test('유틸을 고치면 경계까지 다시 돌고, 그 위와 형제 싱글턴은 돌지 않는다', async () => {
  const remote = host(app(), { replies: [update(2, [app('v2')[2]])] })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./screen.tsx', './api.ts'])
  assert.equal(remote.global('apis'), 2, '고친 모듈의 싱글턴은 다시 만들어진다')
  assert.equal(remote.global('stores'), 1, '형제 싱글턴이 다시 만들어졌다')
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v2/1')
  assert.equal(remote.refreshes(), 1)
})

test('경계를 못 만나고 엔트리에 닿으면 아무것도 돌리지 않고 이유를 달아 호스트를 다시 띄운다', async () => {
  const remote = host(
    [
      mod('./index.ts', 'exports.version = require("./version.ts").version;'),
      mod('./version.ts', 'exports.version = 1;'),
    ],
    { replies: [update(2, [mod('./version.ts', 'exports.version = 2;')])] },
  )
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.fullRefreshes, [
    '[react-native-mf] "settings" 의 ./index.ts 위로 Fast Refresh 경계가 없다',
  ])
  assert.deepEqual(remote.trace.slice(booted), [])
  assert.equal(remote.refreshes(), 0)
})

/** 엔트리 → 페이지(경계) → 위젯(경계). 페이지는 위젯이 내보내는 이름과 그 컴포넌트를 그린다 */
const widget = (body: string) => mod('./widget.tsx', body)
const page = (leaf: ModuleSource) => [
  mod('./index.ts', 'exports.Page = require("./page.tsx").Page;'),
  component(
    './page.tsx',
    'Page',
    'return Object.keys(w).map(function (name) { return name + "=" + w[name](); }).join(",");',
    'var w = require("./widget.tsx");',
  ),
  leaf,
]
const Widget =
  'function Widget() { return "w"; } $RefreshReg$(Widget, "Widget"); exports.Widget = Widget;'
const WidgetAndBadge = `${Widget} function Badge() { return "b"; } $RefreshReg$(Badge, "Badge"); exports.Badge = Badge;`

test('다시 돈 경계가 내보내는 이름이 바뀌면 그 importer 경계도 다시 돌린다', async () => {
  const remote = host(page(widget(Widget)), {
    replies: [update(2, [widget(WidgetAndBadge)])],
  })
  remote.boot()
  const booted = remote.trace.length
  assert.equal(remote.latest('./page.tsx Page')(), 'Widget=w')

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./widget.tsx', './page.tsx'])
  assert.equal(remote.latest('./page.tsx Page')(), 'Widget=w,Badge=b')
  assert.equal(remote.refreshes(), 1)
  assert.deepEqual(remote.fullRefreshes, [])
})

test('같은 이름이 다른 컴포넌트를 가리키게 돼도(family 가 바뀌면) importer 경계를 다시 돌린다', async () => {
  const remote = host(page(widget(Widget)), {
    replies: [
      update(2, [
        widget(
          'function Other() { return "o"; } $RefreshReg$(Other, "Other"); exports.Widget = Other;',
        ),
      ]),
    ],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./widget.tsx', './page.tsx'])
  assert.equal(remote.latest('./page.tsx Page')(), 'Widget=o')
})

test('모양이 그대로인 경계는 위로 넘기지 않는다', async () => {
  const remote = host(page(widget(Widget)), {
    replies: [update(2, [widget(Widget.replace('"w"', '"w2"'))])],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./widget.tsx'])
  assert.equal(remote.latest('./widget.tsx Widget')(), 'w2')
})

test('모양이 바뀐 경계 위로 경계 없이 엔트리에 닿으면 이유를 달아 호스트를 다시 띄운다', async () => {
  const remote = host(
    [
      mod('./index.ts', 'exports.version = 1; exports.Widget = require("./widget.tsx").Widget;'),
      widget(Widget),
    ],
    { replies: [update(2, [widget(`${Widget} exports.label = "w";`)])] },
  )
  remote.boot()

  await remote.polled(2)

  assert.deepEqual(remote.fullRefreshes, [
    '[react-native-mf] "settings" 의 ./index.ts 위로 Fast Refresh 경계가 없다',
  ])
  assert.equal(remote.refreshes(), 0)
})

test('경계인 엔트리의 모양이 바뀌면 호스트가 쥔 옛 값을 이을 수 없어 호스트를 다시 띄운다', async () => {
  const remote = host([mod('./index.tsx', Widget)], {
    replies: [update(2, [mod('./index.tsx', WidgetAndBadge)])],
  })
  remote.boot()

  await remote.polled(2)

  assert.deepEqual(remote.fullRefreshes, [
    '[react-native-mf] "settings" 의 ./index.tsx 위로 Fast Refresh 경계가 없다',
  ])
})

test('모양이 바뀐 경계의 importer 가 같은 적용에서 이미 다시 돌았으면 또 돌리지 않는다', async () => {
  const [id, code] = page(widget(Widget))[1]
  const remote = host(page(widget(Widget)), {
    replies: [update(2, [[id, code.replace('join(",")', 'join(";")')], widget(WidgetAndBadge)])],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted).sort(), ['./page.tsx', './widget.tsx'])
  assert.equal(remote.latest('./page.tsx Page')(), 'Widget=w;Badge=b')
})

test('새 글자 하나가 깨졌으면 아무 모듈도 바꾸지 않고, 오류를 알리고, 다음 갱신이 그 몫까지 싣는다', async () => {
  const screenV2 = component(
    './screen.tsx',
    'Screen',
    'return "v2/" + api.label;',
    'var api = require("./api.ts").api;',
  )
  let fixed = (_reply: Reply) => {}
  const remote = host(app(), {
    replies: [
      update(2, [screenV2, ['./api.ts', '"use strict"; exports.api = {']]),
      new Promise<Reply>((resolve) => {
        fixed = resolve
      }),
    ],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), [])
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v1/1')
  assert.equal(remote.errors.length, 1)
  assert.match(String(remote.errors[0][0]), /"settings" 에 v2 을 적용하지 못했다/)
  assert.equal(remote.fetches[1], 'http://localhost:8082/settings/hot?have=e.1&seen=e.2')

  fixed(update(3, [screenV2, app('v3')[2]]))
  await remote.polled(3)

  assert.equal(remote.latest('./screen.tsx Screen')(), 'v2/v3')
  assert.equal(remote.refreshes(), 1)
})

test('error 응답은 오류 전부를 console.error 로 한 번 띄우고 모듈은 그대로 둔다. 고친 뒤 갱신이 그 사이 몫을 싣는다', async () => {
  let fixed = (_reply: Reply) => {}
  const remote = host(app(), {
    replies: [
      {
        kind: 'error',
        stamp: { epoch: 'e', version: 3 },
        errors: [
          { file: 'src/screen.tsx', message: 'Unexpected token (3:1)' },
          { file: '', message: 'Could not resolve "./gone"' },
        ],
      },
      new Promise<Reply>((resolve) => {
        fixed = resolve
      }),
    ],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.errors, [
    [
      '[react-native-mf] "settings" 를 굽지 못했다. 고칠 때까지 마지막 성공 코드로 돈다\n\nsrc/screen.tsx: Unexpected token (3:1)\n\nCould not resolve "./gone"',
    ],
  ])
  assert.deepEqual(remote.trace.slice(booted), [])
  assert.equal(remote.refreshes(), 0)
  assert.equal(remote.fetches[1], 'http://localhost:8082/settings/hot?have=e.1&seen=e.3')

  fixed(
    update(4, [
      component(
        './screen.tsx',
        'Screen',
        'return "v4/" + api.label;',
        'var api = require("./api.ts").api;',
      ),
      app('v2')[2],
    ]),
  )
  await remote.polled(3)

  assert.equal(remote.latest('./screen.tsx Screen')(), 'v4/v2')
  assert.equal(remote.fetches[2], 'http://localhost:8082/settings/hot?have=e.4&seen=e.4')
})

/** `globalThis.ready` 가 서기 전엔 맨 위에서 던지는 api */
const flakyApi = mod(
  './api.ts',
  'if (!globalThis.ready) throw new Error("not ready"); exports.api = { label: "v2" };',
)

test('갱신 중 던진 모듈은 마지막 성공 값을 지키고, 오류를 알리고, refresh 를 부르지 않는다', async () => {
  const remote = host(app(), { replies: [update(2, [flakyApi])] })
  remote.boot()

  await remote.polled(2)

  // 던진 오류 그대로라 LogBox 가 그 스택(모듈 sourceURL)을 띄운다
  assert.deepEqual(
    remote.reported.map((error) => (error as Error).message),
    ['not ready'],
  )
  assert.match(
    remote.warnings.join('\n'),
    /"settings" 의 \.\/screen\.tsx 를 다시 돌리지 못했다. 고칠 때까지 마지막 성공 코드로 돈다/,
  )
  assert.equal(remote.refreshes(), 0)
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v1/1')
  assert.equal(remote.fetches[1], 'http://localhost:8082/settings/hot?have=e.2&seen=e.2')
})

test('던진 모듈은 다음 메시지가 다시 돌린다. 그 메시지에 바뀐 모듈이 없어도 돈다', async () => {
  let retry = (_reply: Reply) => {}
  const remote = host(app(), {
    replies: [
      update(2, [flakyApi]),
      new Promise<Reply>((resolve) => {
        retry = resolve
      }),
    ],
  })
  remote.boot()
  await remote.polled(2)
  vm.runInContext('globalThis.ready = true', remote.realm)

  retry(update(3, []))
  await remote.polled(3)

  assert.equal(remote.latest('./screen.tsx Screen')(), 'v2/1')
  assert.equal(remote.refreshes(), 1)
  assert.equal(remote.reported.length, 1, '다시 돈 적용이 또 오류를 냈다')
})

test('두 경계가 같이 쓰는 모듈이 던지면 그 적용에서 한 번만 돈다. 다른 경계는 그 마지막 성공 값으로 돈다', async () => {
  const api = (label: string) =>
    mod(
      './api.ts',
      `exports.api = { label: "${label}" }; if (globalThis.boom) throw new Error("boom");`,
    )
  const screen = (id: ModuleId, name: string) =>
    component(id, name, 'return api.label;', 'var api = require("./api.ts").api;')
  const remote = host(
    [
      mod('./index.ts', 'require("./a.tsx"); require("./b.tsx");'),
      screen('./a.tsx', 'A'),
      screen('./b.tsx', 'B'),
      api('v1'),
    ],
    { replies: [update(2, [api('v2')])] },
  )
  remote.boot()
  vm.runInContext('globalThis.boom = true', remote.realm)
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted).sort(), ['./a.tsx', './api.ts', './b.tsx'])
  assert.equal(remote.reported.length, 1)
  assert.equal(remote.latest('./a.tsx A')(), 'v1')
  assert.equal(remote.latest('./b.tsx B')(), 'v1')
  assert.equal(remote.refreshes(), 0)
})

/** 갱신을 하나씩 손으로 흘려보내는 호스트. `send(reply)` 는 기기가 그 응답을 적용하고 다음 요청을 걸 때까지 기다린다 */
function scripted(modules: ModuleSource[], first: Reply) {
  const pending: ((reply: Reply) => void)[] = []
  const later = Array.from(
    { length: 4 },
    () => new Promise<Reply>((resolve) => pending.push(resolve)),
  )
  const remote = host(modules, { replies: [first, ...later] })
  let polls = 2
  const send = async (reply: Reply) => {
    pending.shift()?.(reply)
    polls += 1
    await remote.polled(polls)
  }
  return { remote, send, ready: () => remote.polled(2) }
}

/** 엔트리 아래 두 가지 — 던지는 api 를 쓰는 화면, 그와 무관한 컴포넌트 */
const twoBranches = () => [
  mod('./index.ts', 'require("./screen.tsx"); require("./other.tsx");'),
  ...app().slice(1),
  component('./other.tsx', 'Other', 'return "o1";'),
]
const other = (label: string) => component('./other.tsx', 'Other', `return "${label}";`)

test('계속 던지는 모듈이 남아 있어도 다른 컴포넌트 저장은 refresh 되고, 같은 오류는 다시 알리지 않는다', async () => {
  const { remote, send, ready } = scripted(twoBranches(), update(2, [flakyApi]))
  remote.boot()
  await ready()

  await send(update(3, [other('o2')]))
  await send(update(4, [other('o3')]))

  assert.equal(remote.refreshes(), 2)
  assert.equal(remote.latest('./other.tsx Other')(), 'o3')
  assert.deepEqual(
    remote.reported.map((error) => (error as Error).message),
    ['not ready'],
  )
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v1/1')
})

test('던지던 모듈을 고쳐 저장했는데 또 던지면 같은 오류라도 그 적용은 refresh 를 건너뛰고 다시 알린다', async () => {
  const { remote, send, ready } = scripted(twoBranches(), update(2, [flakyApi]))
  remote.boot()
  await ready()

  await send(
    update(3, [
      other('o2'),
      mod('./api.ts', 'throw new Error("not ready"); // 고쳤지만 그대로 던진다'),
    ]),
  )

  assert.equal(remote.refreshes(), 0)
  assert.deepEqual(
    remote.reported.map((error) => (error as Error).message),
    ['not ready', 'not ready'],
  )
})

test('그대로인 모듈이라도 다른 오류로 던지면 그 적용은 refresh 를 건너뛰고 새 오류를 알린다', async () => {
  const api = mod(
    './api.ts',
    'var config = require("./config.ts").config; if (!config.ok) throw new Error(config.reason); exports.api = { label: "v2" };',
  )
  const config = (reason: string) =>
    mod('./config.ts', `exports.config = { ok: false, reason: "${reason}" };`)
  const { remote, send, ready } = scripted(
    [...twoBranches(), config('not ready')],
    update(2, [api]),
  )
  remote.boot()
  await ready()

  await send(update(3, [other('o2'), config('still not ready')]))

  assert.equal(remote.refreshes(), 0)
  assert.deepEqual(
    remote.reported.map((error) => (error as Error).message),
    ['not ready', 'still not ready'],
  )
})

test('서버를 다시 띄운 뒤의 스냅숏이 글자가 같으면 아무것도 돌리지 않고 커서만 옮긴다', async () => {
  const remote = host(app(), {
    replies: [
      { kind: 'snapshot', stamp: { epoch: 'r', version: 1 }, modules: app(), requires: [] },
    ],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), [])
  assert.equal(remote.refreshes(), 0)
  assert.equal(remote.fetches[1], 'http://localhost:8082/settings/hot?have=r.1&seen=r.1')
})

test('스냅숏에 없는 모듈은 지운다. 그 뒤 그 id 를 require 하면 모르는 모듈이다', async () => {
  const lazy = component(
    './screen.tsx',
    'Screen',
    'return require("./old.ts").old;',
    'require("./old.ts");',
  )
  const remote = host(
    [mod('./index.ts', 'require("./screen.tsx");'), lazy, mod('./old.ts', 'exports.old = 1;')],
    {
      replies: [
        {
          kind: 'snapshot',
          stamp: { epoch: 'r', version: 1 },
          requires: [],
          modules: [
            mod('./index.ts', 'require("./screen.tsx");'),
            component('./screen.tsx', 'Screen', 'return require("./old.ts").old;'),
          ],
        },
      ],
    },
  )
  remote.boot()
  assert.equal(remote.latest('./screen.tsx Screen')(), 1)

  await remote.polled(2)

  assert.throws(
    remote.latest('./screen.tsx Screen'),
    /shared 모듈 "\.\/old\.ts" 이 등록돼 있지 않다/,
  )
})

test('shared 에 없는 키를 새로 읽는 갱신은 빠진 키를 전부 이름 대고 아무것도 돌리지 않는다', async () => {
  let registered = (_reply: Reply) => {}
  const svg = component(
    './screen.tsx',
    'Screen',
    'return svg.marker + "/" + lottie.marker;',
    'var svg = require("react-native-svg"); var lottie = require("lottie-react-native");',
  )
  const requires = ['react', 'react-native-svg', 'lottie-react-native']
  const remote = host(app(), {
    requires: ['react'],
    replies: [
      update(2, [svg], [], requires),
      new Promise<Reply>((resolve) => {
        registered = resolve
      }),
    ],
  })
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.equal(remote.errors.length, 1)
  assert.match(String(remote.errors[0][0]), /"settings" 에 v2 을 적용하지 못했다/)
  assert.match(
    (remote.errors[0][1] as Error).message,
    /shared 모듈 "react-native-svg", "lottie-react-native" 이 등록돼 있지 않다/,
  )
  assert.deepEqual(remote.trace.slice(booted), [])
  assert.equal(remote.fetches[1], 'http://localhost:8082/settings/hot?have=e.1&seen=e.2')

  vm.runInContext(
    `Object.assign(globalThis[${JSON.stringify(SHARED_SCOPE_KEY)}], { "react-native-svg": { marker: "SVG" }, "lottie-react-native": { marker: "LOTTIE" } })`,
    remote.realm,
  )
  registered(update(3, [svg], [], requires))
  await remote.polled(3)

  assert.equal(remote.latest('./screen.tsx Screen')(), 'SVG/LOTTIE')
})

test('갱신 하나로 파일 이름을 바꾸면 새 모듈로 돌고, 옛 id 는 지워져 더는 풀리지 않는다', async () => {
  const screen = (from: string) =>
    component('./screen.tsx', 'Screen', `return require("${from}").label;`, `require("${from}");`)
  const remote = host(
    [
      // 엔트리의 require 를 밖으로 연다. 지운 id 가 아직 풀리는지 본다
      mod(
        './index.ts',
        'require("./screen.tsx"); exports.reach = function (id) { return require(id); };',
      ),
      screen('./old.ts'),
      mod('./old.ts', 'exports.label = "old";'),
    ],
    {
      replies: [
        update(2, [screen('./new.ts'), mod('./new.ts', 'exports.label = "new";')], ['./old.ts']),
      ],
    },
  )
  remote.boot()
  const booted = remote.trace.length

  await remote.polled(2)

  assert.deepEqual(remote.trace.slice(booted), ['./screen.tsx', './new.ts'])
  assert.equal(remote.latest('./screen.tsx Screen')(), 'new')
  assert.throws(
    () => remote.remote().settings.reach('./old.ts'),
    /shared 모듈 "\.\/old\.ts" 이 등록돼 있지 않다/,
  )
  assert.equal(remote.refreshes(), 1)
})

test('fetch 가 거절되면 한 번 경고하고 250 ms 부터 5 s 까지 물러나며, 붙으면 처음으로 돌아간다', async () => {
  const outage = Array<Scripted>(6).fill('reject')
  const remote = host(app(), {
    replies: [
      ...outage,
      update(2, [component('./screen.tsx', 'Screen', 'return "v2";')]),
      'reject',
    ],
  })
  remote.boot()

  for (let n = 1; n <= 6; n += 1) {
    await until(() => remote.timers.length === n, `${n} 번째 물러남`)
    remote.timers[n - 1].callback()
  }
  await until(() => remote.timers.length === 7, '붙은 뒤 다시 끊김')

  assert.deepEqual(
    remote.timers.map(({ ms }) => ms),
    [250, 500, 1000, 2000, 4000, 5000, 250],
  )
  assert.equal(remote.warnings.length, 2, '끊길 때마다 한 번씩')
  assert.match(remote.warnings[0], /"settings" dev 서버에서 갱신을 받지 못했다/)
  assert.equal(remote.latest('./screen.tsx Screen')(), 'v2')
  assert.equal(remote.fetches.length, 8)
})

test('204 는 물러나지 않고 같은 커서로 곧바로 다시 건다', async () => {
  const remote = host(app(), { replies: [204, 204] })
  remote.boot()

  await remote.polled(3)

  assert.equal(new Set(remote.fetches).size, 1)
  assert.deepEqual(remote.timers, [])
})
