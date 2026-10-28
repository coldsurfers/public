/**
 * [1.5] 로더 검증 — 네이티브도 React 도 없이 닫힌다.
 *
 * 여기서 박는 셋은 **타입이 못 잡는 종류**다. 번들을 두 번 실행해도 타입은 통과하고 화면도
 * 그려지는데, 미니앱 top-level 의 `new QueryClient` 가 둘이 된다. 조용히 되돌아갈 수 있어서
 * 실행 횟수 자체를 세어 고정한다.
 */
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { createScriptManager } from '../src/runtime/script-manager'
import type { ScriptStorage } from '../src/runtime/script-storage'

const EXEC_COUNT_KEY = '__RN_MF_TEST_EXEC__'

type Globals = Record<string, unknown>
const globals = globalThis as unknown as Globals

/**
 * 원격 번들이 하는 일을 그대로 흉내낸다 — 실행되면 스스로 레지스트리에 오른다([3]).
 * 실행 횟수를 세는 줄이 미니앱 top-level 의 `new QueryClient` 자리다.
 */
function remoteSource(name: string, marker: string): string {
  const registry = JSON.stringify(REMOTE_REGISTRY_KEY)
  const counter = JSON.stringify(EXEC_COUNT_KEY)

  return [
    `globalThis[${counter}] = (globalThis[${counter}] || 0) + 1;`,
    `globalThis[${registry}] = globalThis[${registry}] || {};`,
    `globalThis[${registry}][${JSON.stringify(name)}] = { default: ${JSON.stringify(marker)} };`,
  ].join('\n')
}

function execCount(): number {
  return (globals[EXEC_COUNT_KEY] as number | undefined) ?? 0
}

/** 네트워크는 이 패키지가 들고 있다 — 스텁을 걸 자리는 전역 `fetch` 하나뿐이다. */
function stubFetch(body: (url: string) => string | Error) {
  let calls = 0

  globals.fetch = ((url: string) => {
    calls += 1
    const result = body(url)
    if (result instanceof Error) return Promise.reject(result)

    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(result) })
  }) as unknown as typeof fetch

  return () => calls
}

function memoryStorage(seed: Record<string, string> = {}) {
  const files = new Map(Object.entries(seed))

  const storage: ScriptStorage = {
    read: (key) => Promise.resolve(files.get(key) ?? null),
    write: (key, content) => {
      files.set(key, content)
      return Promise.resolve()
    },
    remove: (key) => {
      files.delete(key)
      return Promise.resolve()
    },
    list: () => Promise.resolve([...files.keys()]),
  }

  return { storage, files }
}

afterEach(() => {
  // 레지스트리는 전역이다 — 지우지 않으면 앞 테스트가 실행한 번들이 다음 테스트를 통과시킨다
  delete globals[REMOTE_REGISTRY_KEY]
  delete globals[EXEC_COUNT_KEY]
  delete globals.fetch
})

test('같은 이름을 동시에 두 번 불러도 한 번만 받고 한 번만 실행한다', async () => {
  const fetched = stubFetch(() => remoteSource('settings', 'v1'))
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  const [a, b] = await Promise.all([
    manager.load<{ default: string }>('settings'),
    manager.load<{ default: string }>('settings'),
  ])

  assert.equal(fetched(), 1, '같은 이름을 두 번 받았다')
  assert.equal(execCount(), 1, '번들을 두 번 실행했다')
  assert.equal(a.default, 'v1')
  assert.equal(b, a, '같은 값을 돌려줘야 한다')
})

test('이미 레지스트리에 있으면 재실행하지 않는다', async () => {
  const fetched = stubFetch(() => remoteSource('settings', 'v1'))
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  await manager.load('settings')
  const second = await manager.load<{ default: string }>('settings')

  assert.equal(fetched(), 1, '레지스트리에 있는데 다시 받았다')
  assert.equal(execCount(), 1, '레지스트리에 있는데 다시 실행했다')
  assert.equal(second.default, 'v1')
})

test('invalidate 는 keep 밖만 지운다', async () => {
  const { storage, files } = memoryStorage({
    'settings@1.0.0': 'old',
    'settings@1.1.1': 'keep me',
    'settings@1.2.0': 'old',
    'profile@1.0.0': 'other app',
    'not-ours.txt': '남의 파일',
  })
  const manager = createScriptManager({ storage })

  const removed = await manager.invalidate({ keep: ['1.1.1'], name: 'settings' })

  assert.deepEqual(removed.sort(), ['settings@1.0.0', 'settings@1.2.0'])
  assert.deepEqual(
    [...files.keys()].sort(),
    ['not-ours.txt', 'profile@1.0.0', 'settings@1.1.1'],
    'keep · 다른 미니앱 · 우리가 만들지 않은 키는 남아야 한다',
  )
})

test('name 을 생략하면 스토리지 전체를 훑는다', async () => {
  const { storage, files } = memoryStorage({
    'settings@1.1.1': 'keep me',
    'profile@1.0.0': 'other app',
  })
  const manager = createScriptManager({ storage })

  await manager.invalidate({ keep: ['1.1.1'] })

  assert.deepEqual([...files.keys()], ['settings@1.1.1'], '버전이 안 맞는 다른 앱까지 지운다')
})

test('캐시가 있으면 네트워크를 안 탄다', async () => {
  const cached = remoteSource('settings', 'from-cache')
  const { storage } = memoryStorage({ 'settings@1': cached })
  const fetched = stubFetch(() => remoteSource('settings', 'from-network'))
  const manager = createScriptManager({ storage })
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  const loaded = await manager.load<{ default: string }>('settings')

  assert.equal(fetched(), 0, '캐시가 있는데 받았다')
  assert.equal(loaded.default, 'from-cache')
})

test('받은 번들은 버전 키로 저장된다', async () => {
  const { storage, files } = memoryStorage()
  stubFetch(() => remoteSource('settings', 'v1'))
  const manager = createScriptManager({ storage })
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1.1.1' }))

  await manager.load('settings')

  assert.deepEqual([...files.keys()], ['settings@1.1.1'])
})

test('cache · version 이 없으면 디스크를 만지지 않는다', async () => {
  const { storage, files } = memoryStorage()
  const fetched = stubFetch(() => remoteSource('settings', 'dev'))
  const manager = createScriptManager({ storage })
  // dev 레인의 모양이다 — 매번 받는다
  manager.addResolver(() => ({ url: 'http://localhost:8081/settings.bundle', cache: false }))

  await manager.load('settings')

  assert.equal(fetched(), 1)
  assert.deepEqual([...files.keys()], [], 'cache: false 인데 디스크에 남겼다')
})

test('prefetch 는 받아두기만 하고 실행하지 않는다', async () => {
  const { storage, files } = memoryStorage()
  const fetched = stubFetch(() => remoteSource('settings', 'v1'))
  const manager = createScriptManager({ storage })
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  await manager.prefetch('settings')

  assert.equal(fetched(), 1)
  assert.equal(execCount(), 0, 'prefetch 가 미니앱 top-level 을 돌렸다')
  assert.deepEqual([...files.keys()], ['settings@1'])

  // 뒤이은 load 는 캐시를 읽고 실행만 한다
  await manager.load('settings')
  assert.equal(fetched(), 1)
  assert.equal(execCount(), 1)
})

test('resolver 는 등록 순서대로 물어보고 처음 맡는 쪽이 이긴다', async () => {
  stubFetch((url) => remoteSource('settings', url))
  const manager = createScriptManager()
  manager.addResolver((name) =>
    name === 'profile' ? { url: 'https://cdn/profile.js' } : undefined,
  )
  manager.addResolver(() => ({ url: 'https://cdn/settings.js' }))

  const loaded = await manager.load<{ default: string }>('settings')

  assert.equal(loaded.default, 'https://cdn/settings.js')
})

test('맡는 resolver 가 없으면 던진다', async () => {
  const manager = createScriptManager()

  await assert.rejects(() => manager.load('settings'), /resolver 가 없다/)
})

test('실패한 로드를 기억하지 않는다 — 다시 부르면 다시 받는다', async () => {
  let first = true
  const fetched = stubFetch(() => {
    if (first) {
      first = false
      return new Error('network down')
    }
    return remoteSource('settings', 'v1')
  })
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  await assert.rejects(() => manager.load('settings'), /network down/)
  const loaded = await manager.load<{ default: string }>('settings')

  assert.equal(fetched(), 2)
  assert.equal(loaded.default, 'v1')
})

test('네트워크에서 실패해도 어느 번들 · 어느 주소였는지 싣는다', async () => {
  // RN 의 fetch 는 서버에 닿지 못하면 주소 없이 이 한 줄로 거절한다
  const offline = new TypeError('Network request failed')
  stubFetch(() => offline)
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'http://localhost:8082/index.bundle.js' }))

  await assert.rejects(
    () => manager.load('settings'),
    (error: Error) => {
      assert.match(error.message, /"settings" 번들을 받지 못했다/)
      assert.match(error.message, /http:\/\/localhost:8082\/index\.bundle\.js/)
      assert.match(error.message, /Network request failed/)
      assert.equal(error.cause, offline)
      return true
    },
  )
})

test('실행했는데 등록되지 않으면 던진다', async () => {
  stubFetch(() => remoteSource('settings', 'v1'))
  const manager = createScriptManager()
  // 번들이 등록하는 이름과 회수하는 이름이 어긋난 자리 — 빌드의 `--name` 오타가 이 모양이다
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  await assert.rejects(() => manager.load('setting'), /등록되지 않았다/)
})

/** 실패 응답 스텁. 실제 `Response` 처럼 `headers` 를 든다 */
function stubFailure(status: number, contentType: string, text: () => Promise<string>) {
  globals.fetch = (() =>
    Promise.resolve({
      ok: false,
      status,
      headers: new Headers({ 'content-type': contentType }),
      text,
    })) as unknown as typeof fetch
}

test('실패 응답이 text/plain 이면 본문을 에러에 싣는다. dev 서버의 굽기 오류가 기기에 뜬다', async () => {
  const body = `settings 를 굽지 못했다\nsrc/index.ts: Unexpected token (3:1)\n${'x'.repeat(3000)}`
  stubFailure(500, 'text/plain; charset=utf-8', () => Promise.resolve(body))
  const manager = createScriptManager()
  manager.addResolver(() => ({
    url: 'http://localhost:8082/settings/index.bundle.js',
    cache: false,
  }))

  await assert.rejects(
    () => manager.load('settings'),
    (error: Error) => {
      assert.ok(
        error.message.startsWith(
          '[react-native-mf] "settings" 번들을 받지 못했다 (500 http://localhost:8082/settings/index.bundle.js).\nsettings 를 굽지 못했다\nsrc/index.ts: Unexpected token (3:1)\n',
        ),
        error.message,
      )
      assert.ok(error.message.endsWith(body.slice(0, 2000)), '본문 앞 2000자가 붙지 않았다')
      assert.ok(!error.message.includes(body.slice(0, 2001)), '본문을 2000자에서 자르지 않았다')
      return true
    },
  )
})

test('HTML · XML 에러 페이지는 싣지 않고, 본문을 못 읽어도 원래 에러를 던진다', async () => {
  const bare = '[react-native-mf] "settings" 번들을 받지 못했다 (503 https://cdn/settings/v1.js).'
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  for (const [contentType, text] of [
    [
      'text/html; charset=utf-8',
      () => Promise.resolve('<html><body>Service Unavailable</body></html>'),
    ],
    ['application/xml', () => Promise.resolve('<Error><Code>SlowDown</Code></Error>')],
    ['text/plain', () => Promise.reject(new TypeError('body stream already read'))],
  ] as const) {
    stubFailure(503, contentType, text)
    await assert.rejects(() => manager.load('settings'), { message: bare }, contentType)
  }
})

test('headers 가 없는 실패 스텁에도 원래 에러를 던진다', async () => {
  // 소비처 jest mock 에 흔한 모양이다. 본문을 붙이려다 TypeError 로 바뀌면 안 된다
  globals.fetch = (() => Promise.resolve({ ok: false, status: 500 })) as unknown as typeof fetch
  const manager = createScriptManager()
  manager.addResolver(() => ({ url: 'https://cdn/settings/v1.js', version: '1' }))

  await assert.rejects(() => manager.load('settings'), {
    message: '[react-native-mf] "settings" 번들을 받지 못했다 (500 https://cdn/settings/v1.js).',
  })
})
