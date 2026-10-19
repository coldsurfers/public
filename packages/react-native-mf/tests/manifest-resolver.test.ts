import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import type { Manifest, Release } from '../src/manifest'
import { createManifestResolver } from '../src/runtime/manifest-resolver'
import { REMOTE_REGISTRY_KEY } from '../src/runtime/registry'
import { createScriptManager } from '../src/runtime/script-manager'
import type { ScriptStorage } from '../src/runtime/script-storage'
import { registerShared, SHARED_SCOPE_KEY } from '../src/runtime/shared-scope'

type Globals = Record<string, unknown>
const globals = globalThis as unknown as Globals

const BASE = 'https://cdn.example.com/'
const MANIFEST_URL = 'https://cdn.example.com/apps/settings/production/manifest.json'

type Reply = { status: number; body: string } | Error | 'hang'

function stubFetch(routes: Record<string, Reply>) {
  const requested: string[] = []
  globals.fetch = ((url: string, init?: { signal?: AbortSignal }) => {
    requested.push(url)
    const reply = routes[url] ?? { status: 404, body: '' }
    if (reply === 'hang') {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      })
    }
    if (reply instanceof Error) return Promise.reject(reply)
    return Promise.resolve({
      ok: reply.status < 400,
      status: reply.status,
      text: () => Promise.resolve(reply.body),
    })
  }) as unknown as typeof fetch
  return requested
}

const release = (version: string, requires: string[], enabled = true): Release => ({
  version,
  requires,
  enabled,
  deployedAt: '2026-10-19T00:00:00.000Z',
})

const manifestReply = (releases: Release[]): Reply => ({
  status: 200,
  body: JSON.stringify({ name: 'settings', releases } satisfies Manifest),
})

function cacheWith(keys: string[]): ScriptStorage {
  const files = new Map(keys.map((key) => [key, `cached ${key}`]))
  return {
    read: (key) => Promise.resolve(files.get(key) ?? null),
    write: (key, content) => Promise.resolve(void files.set(key, content)),
    remove: (key) => Promise.resolve(void files.delete(key)),
    list: () => Promise.resolve([...files.keys()]),
  }
}

const resolverWith = (extra: Partial<Parameters<typeof createManifestResolver>[0]> = {}) =>
  createManifestResolver({
    baseUrl: BASE,
    prefix: 'apps',
    channel: 'production',
    names: ['settings'],
    ...extra,
  })

afterEach(() => {
  delete globals[SHARED_SCOPE_KEY]
  delete globals[REMOTE_REGISTRY_KEY]
  delete globals.fetch
})

test('켜져 있고 호스트가 shared 를 다 내놓는 첫 릴리스를 고른다', async () => {
  registerShared({ react: {}, 'react-native': {} })
  stubFetch({
    [MANIFEST_URL]: manifestReply([
      release('1.4.0', ['react', '@tanstack/react-query']),
      release('1.3.0', ['react'], false),
      release('1.2.0', ['react', 'react-native']),
    ]),
  })

  assert.deepEqual(await resolverWith()('settings'), {
    url: 'https://cdn.example.com/apps/settings/1.2.0/index.bundle.js',
    version: '1.2.0',
  })
})

test('맡지 않은 이름은 매니페스트를 받지 않고 넘긴다', async () => {
  const requested = stubFetch({})
  assert.equal(await resolverWith()('profile'), undefined)
  assert.deepEqual(requested, [])
})

test('매니페스트를 받았는데 맞는 릴리스가 없으면 캐시가 있어도 던진다', async () => {
  registerShared({ react: {} })
  stubFetch({ [MANIFEST_URL]: manifestReply([release('1.4.0', ['react', 'react-native'])]) })
  const onError: unknown[] = []

  const resolve = resolverWith({
    storage: cacheWith(['settings@1.1.0']),
    onError: (e) => onError.push(e),
  })
  await assert.rejects(
    async () => resolve('settings'),
    /맞는 릴리스가 없다. 호스트에 없는 shared: react-native/,
  )
  assert.equal(onError.length, 0)
})

test('매니페스트를 못 받으면 이 이름의 가장 높은 캐시 버전으로 열고 원인을 알린다', async () => {
  stubFetch({ [MANIFEST_URL]: new Error('offline') })
  const reported: string[] = []

  const locator = await resolverWith({
    storage: cacheWith(['settings@1.9.0', 'settings@1.10.0', 'profile@9.0.0', 'notes.txt']),
    onError: (error, name) => reported.push(`${name}: ${(error as Error).message}`),
  })('settings')

  assert.equal(locator?.version, '1.10.0')
  assert.deepEqual(reported, ['settings: offline'])
})

test('캐시 버전은 semver 프리릴리스 순서로 비교한다', async () => {
  stubFetch({ [MANIFEST_URL]: new Error('offline') })
  const latest = async (keys: string[]) =>
    (await resolverWith({ storage: cacheWith(keys) })('settings'))?.version

  assert.equal(await latest(['settings@1.2.0-beta.2', 'settings@1.2.0-beta.10']), '1.2.0-beta.10')
  assert.equal(await latest(['settings@1.2.0-beta.10', 'settings@1.2.0']), '1.2.0')
  assert.equal(await latest(['settings@1.2.0-beta', 'settings@1.2.0-1']), '1.2.0-beta')
})

test('매니페스트로 고르면 이 이름의 다른 캐시 버전을 지운다', async () => {
  registerShared({ react: {} })
  stubFetch({ [MANIFEST_URL]: manifestReply([release('1.2.0', ['react'])]) })
  const storage = cacheWith(['settings@1.3.0', 'settings@1.2.0', 'profile@1.0.0'])

  await resolverWith({ storage })('settings')

  assert.deepEqual(await storage.list(), ['settings@1.2.0', 'profile@1.0.0'])
})

test('시간 안에 못 받아도 캐시로 넘어간다', async () => {
  stubFetch({ [MANIFEST_URL]: 'hang' })
  const locator = await resolverWith({
    storage: cacheWith(['settings@1.2.0']),
    timeoutMs: 20,
  })('settings')
  assert.equal(locator?.version, '1.2.0')
})

test('못 받았고 캐시도 없으면 원래 실패를 던진다', async () => {
  stubFetch({ [MANIFEST_URL]: { status: 503, body: '' } })
  const resolve = resolverWith({ storage: cacheWith([]) })
  await assert.rejects(async () => resolve('settings'), /503/)
})

test('scriptManager 에 꽂으면 고른 버전의 번들을 받아 실행한다', async () => {
  registerShared({ react: {} })
  const bundleUrl = 'https://cdn.example.com/apps/settings/1.2.0/index.bundle.js'
  const registry = JSON.stringify(REMOTE_REGISTRY_KEY)
  const requested = stubFetch({
    [MANIFEST_URL]: manifestReply([release('1.2.0', ['react'])]),
    [bundleUrl]: {
      status: 200,
      body: `globalThis[${registry}] = { settings: { default: 'v1.2.0' } };`,
    },
  })
  const manager = createScriptManager()
  manager.addResolver(resolverWith())

  assert.deepEqual(await manager.load('settings'), { default: 'v1.2.0' })
  assert.deepEqual(requested, [MANIFEST_URL, bundleUrl])
})
