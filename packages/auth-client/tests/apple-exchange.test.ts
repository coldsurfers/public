import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AuthError } from '../src/errors'
import { HttpClient } from '../src/http'
import { AppleProvider } from '../src/providers/apple'
import { MemoryTokenStorage } from '../src/storage/memory'

// Apple `exchangeCode` 의 contract:
//  1) Apple token endpoint 에 application/x-www-form-urlencoded 로 POST
//  2) 성공 시 id_token/access_token 등 응답을 그대로 반환
//  3) 네트워크 실패 → AuthError(SDK_NETWORK_ERROR)
//  4) non-2xx 응답 → AuthError(SDK_PROVIDER_ERROR)
// `buildRedirectUrl` 의 contract:
//  - response_mode 기본 form_post, scope 기본 'name email'
//  - scope='' 명시 시 scope 파라미터 자체 생략 (Apple 의 query mode 호환)

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function buildProvider(fetchImpl: typeof fetch) {
  const http = new HttpClient({
    baseUrl: 'https://auth.test.local',
    apiVersion: 'v2',
    storage: new MemoryTokenStorage(),
    fetch: fetchImpl,
  })
  return new AppleProvider(http)
}

describe('AppleProvider — buildRedirectUrl', () => {
  it('기본값 — response_type=code, response_mode=form_post, scope=name email', () => {
    const provider = buildProvider((async () => new Response('')) as typeof fetch)
    const url = provider.buildRedirectUrl({
      clientId: 'com.test.svc',
      redirectUri: 'https://x.local/cb',
    })
    const parsed = new URL(url)
    assert.equal(parsed.origin + parsed.pathname, 'https://appleid.apple.com/auth/authorize')
    assert.equal(parsed.searchParams.get('client_id'), 'com.test.svc')
    assert.equal(parsed.searchParams.get('redirect_uri'), 'https://x.local/cb')
    assert.equal(parsed.searchParams.get('response_type'), 'code')
    assert.equal(parsed.searchParams.get('response_mode'), 'form_post')
    assert.equal(parsed.searchParams.get('scope'), 'name email')
  })

  it('scope 빈 문자열 명시 시 scope 파라미터 생략', () => {
    const provider = buildProvider((async () => new Response('')) as typeof fetch)
    const url = provider.buildRedirectUrl({
      clientId: 'com.test.svc',
      redirectUri: 'https://x.local/cb',
      scope: '',
      responseMode: 'query',
    })
    const parsed = new URL(url)
    assert.equal(parsed.searchParams.has('scope'), false)
    assert.equal(parsed.searchParams.get('response_mode'), 'query')
  })

  it('state · nonce 전달', () => {
    const provider = buildProvider((async () => new Response('')) as typeof fetch)
    const url = provider.buildRedirectUrl({
      clientId: 'com.test.svc',
      redirectUri: 'https://x.local/cb',
      state: 'abc',
      nonce: 'xyz',
    })
    const parsed = new URL(url)
    assert.equal(parsed.searchParams.get('state'), 'abc')
    assert.equal(parsed.searchParams.get('nonce'), 'xyz')
  })
})

describe('AppleProvider — exchangeCode', () => {
  it('성공 — form-urlencoded body, parsed JSON 반환', async () => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = []
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return jsonResponse(200, {
        id_token: 'id-1',
        access_token: 'acc-1',
        refresh_token: 'ref-1',
        expires_in: 3600,
        token_type: 'Bearer',
      })
    }) as typeof fetch
    const provider = buildProvider(fetchImpl)

    const res = await provider.exchangeCode({
      code: 'AUTH-CODE',
      clientId: 'com.test.svc',
      clientSecret: 'es256-jwt-here',
      redirectUri: 'https://x.local/cb',
    })

    assert.equal(res.id_token, 'id-1')
    assert.equal(res.access_token, 'acc-1')
    assert.equal(res.refresh_token, 'ref-1')

    assert.equal(calls.length, 1)
    assert.equal(calls[0]?.url, 'https://appleid.apple.com/auth/token')
    assert.equal(calls[0]?.init?.method, 'POST')
    const headers = new Headers(calls[0]?.init?.headers)
    assert.equal(headers.get('Content-Type'), 'application/x-www-form-urlencoded')

    const body = calls[0]?.init?.body as URLSearchParams
    const parsed = new URLSearchParams(body.toString())
    assert.equal(parsed.get('code'), 'AUTH-CODE')
    assert.equal(parsed.get('client_id'), 'com.test.svc')
    assert.equal(parsed.get('client_secret'), 'es256-jwt-here')
    assert.equal(parsed.get('redirect_uri'), 'https://x.local/cb')
    assert.equal(parsed.get('grant_type'), 'authorization_code')
  })

  it('네트워크 실패 → SDK_NETWORK_ERROR', async () => {
    const fetchImpl = (async () => {
      throw new Error('boom')
    }) as typeof fetch
    const provider = buildProvider(fetchImpl)
    await assert.rejects(
      provider.exchangeCode({
        code: 'c',
        clientId: 'id',
        clientSecret: 's',
        redirectUri: 'r',
      }),
      (err: unknown) => err instanceof AuthError && err.code === 'SDK_NETWORK_ERROR',
    )
  })

  it('non-2xx → SDK_PROVIDER_ERROR + status 전달', async () => {
    const fetchImpl = (async () => jsonResponse(400, { error: 'invalid_grant' })) as typeof fetch
    const provider = buildProvider(fetchImpl)
    await assert.rejects(
      provider.exchangeCode({
        code: 'c',
        clientId: 'id',
        clientSecret: 's',
        redirectUri: 'r',
      }),
      (err: unknown) =>
        err instanceof AuthError && err.code === 'SDK_PROVIDER_ERROR' && err.status === 400,
    )
  })

  it('tokenEndpoint override — 테스트용 endpoint 우선', async () => {
    const calls: string[] = []
    const fetchImpl = (async (input: RequestInfo | URL) => {
      calls.push(String(input))
      return jsonResponse(200, {
        id_token: 'i',
        access_token: 'a',
        expires_in: 1,
        token_type: 'Bearer',
      })
    }) as typeof fetch
    const provider = buildProvider(fetchImpl)
    await provider.exchangeCode({
      code: 'c',
      clientId: 'id',
      clientSecret: 's',
      redirectUri: 'r',
      tokenEndpoint: 'https://mock.apple.local/token',
    })
    assert.equal(calls[0], 'https://mock.apple.local/token')
  })
})
