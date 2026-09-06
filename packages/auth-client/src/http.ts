import { AuthError } from './errors'
import type { TokenStorage } from './storage/index'
import type { ApiVersion, AuthTokenDTO, ErrorResponseDTO, UserWithAuthTokenDTO } from './types'

export interface HttpClientOptions {
  baseUrl: string
  apiVersion: ApiVersion
  storage: TokenStorage
  fetch?: typeof fetch
  // 호출자 식별·로깅·환경 분기 등에 쓸 추가 헤더.
  defaultHeaders?: HeadersInit
}

// public — consumer 가 `HttpClient.request` 직접 호출 시 사용.
export interface RequestOptions {
  // Authorization: Bearer <accessToken> 첨부. 401 시 자동 refresh + 1회 재시도.
  auth?: boolean
}

// internal — refresh 자체가 401 시 무한 루프 안 들어가도록 표시. consumer 노출 금지.
interface InternalRequestOptions extends RequestOptions {
  isRefresh?: boolean
}

// refresh 경로 — v1 / v2 매핑.
const REFRESH_PATH: Record<ApiVersion, string> = {
  v1: '/v1/auth/reissue-token',
  v2: '/v2/auth/tokens/refresh',
}

export class HttpClient {
  readonly baseUrl: string
  readonly apiVersion: ApiVersion
  // provider 들이 *AuthClient 가 주입한 fetch* 를 그대로 쓰도록 readonly 노출.
  // SSR/테스트에서 mocking 일관성 보장 (GoogleProvider.exchangeCode 도 이 fetch 사용).
  readonly fetchImpl: typeof fetch
  private readonly storage: TokenStorage
  private readonly defaultHeaders: HeadersInit
  // 동시 401 진입 시 refresh 호출을 *한 번만* 수행하도록 promise 공유.
  private refreshInFlight: Promise<AuthTokenDTO> | null = null

  constructor(opts: HttpClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '')
    this.apiVersion = opts.apiVersion
    this.storage = opts.storage
    // native `fetch` 는 receiver 가 globalThis 여야 동작 (브라우저: `Illegal invocation`).
    // method 형태 (`this.fetchImpl(...)`) 로 호출하므로 명시적으로 bind.
    const baseFetch = opts.fetch ?? globalThis.fetch
    if (!baseFetch) {
      throw new AuthError({
        code: 'SDK_ENV_UNAVAILABLE',
        message: 'HttpClient: globalThis.fetch 가 없습니다. `fetch` 옵션으로 주입하세요.',
      })
    }
    this.fetchImpl = opts.fetch ? baseFetch : baseFetch.bind(globalThis)
    this.defaultHeaders = opts.defaultHeaders ?? {}
  }

  async request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
    return this.requestInternal<T>(path, init, options)
  }

  private async requestInternal<T>(
    path: string,
    init: RequestInit = {},
    options: InternalRequestOptions = {},
  ): Promise<T> {
    const headers = new Headers(this.defaultHeaders)
    const initHeaders = new Headers(init.headers)
    initHeaders.forEach((value, key) => {
      headers.set(key, value)
    })
    if (init.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }
    if (options.auth) {
      const accessToken = await this.storage.getAccessToken()
      if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
    }

    const url = `${this.baseUrl}${path}`
    let response: Response
    try {
      response = await this.fetchImpl(url, { ...init, headers })
    } catch (cause) {
      throw new AuthError({
        code: 'SDK_NETWORK_ERROR',
        message: `Network error calling ${url}`,
        cause,
      })
    }

    if (response.status === 401 && options.auth && !options.isRefresh) {
      // 동시 401 → 단일 refresh 공유.
      await this.refresh()
      // 재시도 1 회. 다시 401 면 SDK_UNAUTHORIZED 로 종결.
      const retryHeaders = new Headers(headers)
      const newAccess = await this.storage.getAccessToken()
      if (newAccess) retryHeaders.set('authorization', `Bearer ${newAccess}`)
      try {
        response = await this.fetchImpl(url, { ...init, headers: retryHeaders })
      } catch (cause) {
        throw new AuthError({
          code: 'SDK_NETWORK_ERROR',
          message: `Network error retrying ${url}`,
          cause,
        })
      }
      if (response.status === 401) {
        await this.storage.clear()
        throw new AuthError({
          code: 'SDK_UNAUTHORIZED',
          message: 'Unauthorized after token refresh',
          status: 401,
        })
      }
    }

    if (!response.ok) {
      const body = await safeJson<ErrorResponseDTO>(response)
      throw new AuthError({
        code: body?.code ?? 'SDK_UNKNOWN',
        message: body?.message ?? `Request failed with status ${response.status}`,
        status: response.status,
        response: body ?? undefined,
      })
    }

    // 204·빈 body 대응.
    if (response.status === 204) return undefined as T
    const data = (await safeJson<T>(response)) as T
    return data
  }

  // 동시 401 → *단일* refresh 공유. 모든 await 는 IIFE *내부* — 아니면
  // 동시 진입자가 모두 첫 await 를 통과한 뒤 각자 refreshInFlight 를 덮어쓴다.
  //
  // public — auth 가 아닌 *다른 서버*(billets API 등) 의 401 을 받은 호출자가 재발급만
  // 트리거할 때 쓴다. 성공하면 storage 에 새 토큰이 들어가 있고, 실패하면 storage 가
  // 비워진 채 AuthError 가 던져진다. 호출자가 그 절차를 다시 짜지 않게 하려는 자리다.
  refresh(): Promise<AuthTokenDTO> {
    if (this.refreshInFlight) return this.refreshInFlight
    this.refreshInFlight = (async () => {
      try {
        const refreshToken = await this.storage.getRefreshToken()
        if (!refreshToken) {
          await this.storage.clear()
          throw new AuthError({
            code: 'SDK_NO_REFRESH_TOKEN',
            message: 'No refresh token available',
          })
        }
        const refreshed = await this.requestInternal<UserWithAuthTokenDTO>(
          REFRESH_PATH[this.apiVersion],
          {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          },
          { isRefresh: true },
        )
        await this.storage.setTokens(refreshed.authToken)
        return refreshed.authToken
      } catch (cause) {
        // SDK_NO_REFRESH_TOKEN 은 그대로 throw — 상위가 의미를 잃지 않도록.
        if (cause instanceof AuthError && cause.code === 'SDK_NO_REFRESH_TOKEN') throw cause
        await this.storage.clear()
        throw cause instanceof AuthError
          ? new AuthError({
              code: 'SDK_REFRESH_FAILED',
              message: 'Failed to refresh tokens',
              status: cause.status,
              response: cause.response,
              cause,
            })
          : new AuthError({
              code: 'SDK_REFRESH_FAILED',
              message: 'Failed to refresh tokens',
              cause,
            })
      } finally {
        this.refreshInFlight = null
      }
    })()
    return this.refreshInFlight
  }
}

async function safeJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}
