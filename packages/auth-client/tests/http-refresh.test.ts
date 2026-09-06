import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { AuthError } from '../src/errors'
import { HttpClient } from '../src/http'
import { MemoryTokenStorage } from '../src/storage/memory'
import type { UserWithAuthTokenDTO } from '../src/types'

// 401 → refresh → 재시도 흐름의 *correctness* 게이트.
// 본 SDK 가 publish 되기 전 이 3 케이스가 통과되어야 surfers-root 두 consumer 가 안전.

const BASE_URL = 'https://auth.test.local'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function buildClient(fetchImpl: typeof fetch, storage = new MemoryTokenStorage()) {
  return {
    client: new HttpClient({ baseUrl: BASE_URL, apiVersion: 'v2', storage, fetch: fetchImpl }),
    storage,
  }
}

const REFRESHED_TOKENS: UserWithAuthTokenDTO = {
  user: {
    id: 'u1',
    email: 'x@y.z',
    provider: 'email',
    handle: null,
    deactivatedAt: null,
  },
  authToken: { accessToken: 'access-NEW', refreshToken: 'refresh-NEW' },
}

describe('HttpClient — refresh 동시성 락', () => {
  let calls: Array<{ url: string; init: RequestInit | undefined }>

  beforeEach(() => {
    calls = []
  })

  afterEach(() => {
    mock.reset()
  })

  it('N 개 동시 401 → /tokens/refresh 호출 1회만, 모두 성공', async () => {
    const protectedPath = '/v1/user/me'
    const refreshPath = '/v2/auth/tokens/refresh'

    // 첫 access token 으로 GET /user/me 호출은 401. refresh 후 새 access token 으로는 200.
    const fetchImpl: typeof fetch = async (url, init) => {
      const u = url.toString()
      const headers = new Headers(init?.headers)
      const auth = headers.get('authorization')
      calls.push({ url: u, init: init ?? undefined })

      if (u.endsWith(refreshPath)) {
        return jsonResponse(200, REFRESHED_TOKENS)
      }
      if (u.endsWith(protectedPath)) {
        return auth === 'Bearer access-NEW'
          ? jsonResponse(200, { ok: true })
          : jsonResponse(401, {})
      }
      throw new Error(`unexpected ${u}`)
    }

    const { client, storage } = buildClient(fetchImpl)
    await storage.setTokens({ accessToken: 'access-OLD', refreshToken: 'refresh-OLD' })

    // 5개 동시 호출
    const results = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        client.request<{ ok: boolean }>(protectedPath, { method: 'GET' }, { auth: true }),
      ),
    )

    assert.equal(results.length, 5)
    for (const r of results) assert.deepEqual(r, { ok: true })

    // refresh 는 단 한 번
    const refreshCalls = calls.filter((c) => c.url.endsWith(refreshPath))
    assert.equal(refreshCalls.length, 1, 'refresh 는 1회만 호출되어야 함')

    // storage 가 새 token 으로 갱신됨
    assert.equal(await storage.getAccessToken(), 'access-NEW')
    assert.equal(await storage.getRefreshToken(), 'refresh-NEW')

    // 첫 라운드 5 + refresh 1 + 재시도 5 = 11
    assert.equal(calls.length, 11)
  })

  it('refresh 자체가 실패 → 동시 호출 모두 SDK_REFRESH_FAILED, storage clear', async () => {
    const protectedPath = '/v1/user/me'
    const refreshPath = '/v2/auth/tokens/refresh'

    const fetchImpl: typeof fetch = async (url) => {
      const u = url.toString()
      calls.push({ url: u, init: undefined })
      if (u.endsWith(refreshPath))
        return jsonResponse(401, { code: 'INVALID_REFRESH', message: 'expired' })
      if (u.endsWith(protectedPath)) return jsonResponse(401, {})
      throw new Error(`unexpected ${u}`)
    }

    const { client, storage } = buildClient(fetchImpl)
    await storage.setTokens({ accessToken: 'access-OLD', refreshToken: 'refresh-OLD' })

    const results = await Promise.allSettled(
      Array.from({ length: 3 }).map(() =>
        client.request(protectedPath, { method: 'GET' }, { auth: true }),
      ),
    )

    assert.equal(results.length, 3)
    for (const r of results) {
      assert.equal(r.status, 'rejected')
      const reason = (r as PromiseRejectedResult).reason
      assert.ok(reason instanceof AuthError)
      assert.equal((reason as AuthError).code, 'SDK_REFRESH_FAILED')
    }

    // refresh 시도는 1회만
    const refreshCalls = calls.filter((c) => c.url.endsWith(refreshPath))
    assert.equal(refreshCalls.length, 1)

    // storage 비워짐
    assert.equal(await storage.getAccessToken(), null)
    assert.equal(await storage.getRefreshToken(), null)
  })

  it('refresh token 부재 → SDK_NO_REFRESH_TOKEN, refresh endpoint 호출 안 됨', async () => {
    const protectedPath = '/v1/user/me'
    const refreshPath = '/v2/auth/tokens/refresh'

    const fetchImpl: typeof fetch = async (url) => {
      const u = url.toString()
      calls.push({ url: u, init: undefined })
      if (u.endsWith(protectedPath)) return jsonResponse(401, {})
      throw new Error(`unexpected ${u}`)
    }

    // accessToken 만 있고 refreshToken 은 falsy ('') 인 비정상 상태 — refresh 단계에서 즉시 종결되어야 함.
    const storage = new MemoryTokenStorage()
    await storage.setTokens({ accessToken: 'access-OLD', refreshToken: '' })
    const { client } = buildClient(fetchImpl, storage)

    await assert.rejects(
      client.request(protectedPath, { method: 'GET' }, { auth: true }),
      (err: unknown) => err instanceof AuthError && err.code === 'SDK_NO_REFRESH_TOKEN',
    )
    assert.equal(
      calls.filter((c) => c.url.endsWith(refreshPath)).length,
      0,
      'refresh endpoint 호출 금지',
    )
    assert.equal(
      calls.filter((c) => c.url.endsWith(protectedPath)).length,
      1,
      'protected 는 1회 호출 후 종결',
    )
  })
})
