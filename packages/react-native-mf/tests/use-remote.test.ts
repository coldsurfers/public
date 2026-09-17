/**
 * Suspense 어댑터 검증 — **React 없이 닫힌다.** 훅이 React API 를 하나도 부르지 않아서
 * 렌더러가 필요 없다: 값을 돌려주는지, 약속을 던지는지만 보면 계약이 전부 덮인다.
 */
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { REMOTE_REGISTRY_KEY, registerRemote } from '../src/runtime/registry'
import { scriptManager } from '../src/runtime/script-manager'
import { useRemote } from '../src/runtime/use-remote'

type Globals = Record<string, unknown>
const globals = globalThis as unknown as Globals

function remoteSource(name: string): string {
  const registry = JSON.stringify(REMOTE_REGISTRY_KEY)

  return [
    `globalThis[${registry}] = globalThis[${registry}] || {};`,
    `globalThis[${registry}][${JSON.stringify(name)}] = { default: 'late' };`,
  ].join('\n')
}

afterEach(() => {
  delete globals[REMOTE_REGISTRY_KEY]
  delete globals.fetch
})

test('이미 등록돼 있으면 동기로 돌려준다 — 던지지 않는다', () => {
  registerRemote('settings', { default: 'now' })

  assert.deepEqual(useRemote('settings'), { default: 'now' })
})

test('등록 전이면 약속을 던지고, 정착한 뒤엔 동기로 끝난다', async () => {
  globals.fetch = (() =>
    Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(remoteSource('settings')),
    })) as unknown as typeof fetch

  const dispose = scriptManager.addResolver(() => ({ url: 'https://cdn/settings.js' }))

  try {
    let thrown: unknown
    try {
      // biome-ignore lint/correctness/useHookAtTopLevel: 렌더 밖에서 부르는 게 이 테스트의 요지다 — `useRemote` 는 React API 를 안 부르므로 훅 규칙이 걸리지 않는다
      useRemote('settings')
    } catch (error) {
      thrown = error
    }

    // Suspense 경계가 받는 값이다 — 에러가 아니라 약속이어야 한다
    assert.ok(thrown instanceof Promise)
    await thrown

    // 같은 렌더 사이클이 다시 돌면 이번엔 던지지 않는다
    // biome-ignore lint/correctness/useHookAtTopLevel: 위와 같은 이유
    assert.deepEqual(useRemote('settings'), { default: 'late' })
  } finally {
    dispose()
  }
})

test('던진 약속은 load 와 같은 것이다 — 두 번 받지 않는다', async () => {
  let fetched = 0
  globals.fetch = (() => {
    fetched += 1
    return Promise.resolve({
      ok: true,
      status: 200,
      text: () => Promise.resolve(remoteSource('profile')),
    })
  }) as unknown as typeof fetch

  const dispose = scriptManager.addResolver(() => ({ url: 'https://cdn/profile.js' }))

  try {
    const promises: Promise<unknown>[] = []
    // 렌더가 세 번 도는 동안 아직 아무것도 정착하지 않은 상황
    for (let i = 0; i < 3; i += 1) {
      try {
        // biome-ignore lint/correctness/useHookAtTopLevel: 렌더 세 번을 흉내내는 자리다 — 위와 같은 이유
        useRemote('profile')
      } catch (error) {
        promises.push(error as Promise<unknown>)
      }
    }

    await Promise.all(promises)
    assert.equal(promises.length, 3)
    assert.equal(fetched, 1)
  } finally {
    dispose()
  }
})
