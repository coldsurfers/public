import { AuthError } from '../errors'
import type { HttpClient } from '../http'
import { PATHS } from '../paths'
import type { PlatformDTO, SignInBodyDTO, SignUpBodyDTO, UserWithAuthTokenDTO } from '../types'

export interface AppleRedirectOptions {
  clientId: string
  redirectUri: string
  // 기본 `name email` — 첫 가입 시 1회 전달용. 빈 문자열 명시 시 scope 생략.
  scope?: string
  state?: string
  // 기본 `code` (Authorization Code flow).
  responseType?: 'code' | 'code id_token'
  // 기본 `form_post` — `name email` scope 사용 시 Apple 권장. scope 비울 경우 `query` 가능.
  responseMode?: 'query' | 'fragment' | 'form_post'
  nonce?: string
}

export interface AppleExchangeOptions {
  code: string
  clientId: string
  // Apple 의 `client_secret` 은 *consumer 가 동적 생성* 한 ES256 JWT — SDK 는 받기만.
  // 생성 책임은 consumer (Apple private key 보호 영역). Google 의 정적 client_secret 과 다름.
  clientSecret: string
  redirectUri: string
  // OAuth2 token endpoint override (테스트용).
  tokenEndpoint?: string
}

export interface AppleExchangeResponse {
  id_token: string
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export interface AppleSigninOptions {
  // Apple Sign-In SDK 또는 token exchange 결과의 identity token (ES256 JWT).
  idToken: string
  email: string
  platform?: PlatformDTO
}

export interface AppleSignupOptions extends AppleSigninOptions {
  termsVersionIds?: string[]
  marketingConsent?: boolean
  nightMarketingConsent?: boolean
}

const APPLE_AUTHZ_ENDPOINT = 'https://appleid.apple.com/auth/authorize'
const APPLE_TOKEN_ENDPOINT = 'https://appleid.apple.com/auth/token'

export class AppleProvider {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  // OAuth redirect URL 구성. 호출자는 window.location.href 또는 NextResponse.redirect 로 이동.
  // Apple 의 `name email` scope 는 `form_post` response_mode 와 짝 — POST 본문으로 user 정보 1회 전달.
  buildRedirectUrl(opts: AppleRedirectOptions): string {
    const params = new URLSearchParams({
      client_id: opts.clientId,
      redirect_uri: opts.redirectUri,
      response_type: opts.responseType ?? 'code',
      response_mode: opts.responseMode ?? 'form_post',
    })
    const scope = opts.scope ?? 'name email'
    if (scope) params.set('scope', scope)
    if (opts.state) params.set('state', opts.state)
    if (opts.nonce) params.set('nonce', opts.nonce)
    return `${APPLE_AUTHZ_ENDPOINT}?${params.toString()}`
  }

  // Authorization Code → token 교환. *서버 측에서만 호출*.
  // RFC 6749 §4.1.3 — Apple token endpoint 는 application/x-www-form-urlencoded.
  // `clientSecret` 은 consumer 가 ES256 JWT 로 즉시 발급해 전달 (Apple private key 영역).
  // fetch 는 HttpClient.fetchImpl 사용 — AuthClient({ fetch }) 주입이 Apple 호출까지 일관.
  async exchangeCode(opts: AppleExchangeOptions): Promise<AppleExchangeResponse> {
    const endpoint = opts.tokenEndpoint ?? APPLE_TOKEN_ENDPOINT
    const body = new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: 'authorization_code',
    })
    let response: Response
    try {
      response = await this.http.fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
    } catch (cause) {
      throw new AuthError({
        code: 'SDK_NETWORK_ERROR',
        message: 'Failed calling Apple token endpoint',
        cause,
      })
    }
    if (!response.ok) {
      throw new AuthError({
        code: 'SDK_PROVIDER_ERROR',
        message: `Apple token exchange failed (${response.status})`,
        status: response.status,
      })
    }
    return (await response.json()) as AppleExchangeResponse
  }

  signin(opts: AppleSigninOptions): Promise<UserWithAuthTokenDTO> {
    const body: SignInBodyDTO = {
      provider: 'apple',
      email: opts.email,
      token: opts.idToken,
      platform: opts.platform,
    }
    return this.http.request(PATHS[this.http.apiVersion].signin, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  signup(opts: AppleSignupOptions): Promise<UserWithAuthTokenDTO> {
    const body: SignUpBodyDTO = {
      provider: 'apple',
      email: opts.email,
      token: opts.idToken,
      platform: opts.platform,
      termsVersionIds: opts.termsVersionIds,
      marketingConsent: opts.marketingConsent,
      nightMarketingConsent: opts.nightMarketingConsent,
    }
    return this.http.request(PATHS[this.http.apiVersion].signup, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}
