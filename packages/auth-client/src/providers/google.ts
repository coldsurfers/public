import { AuthError } from '../errors'
import type { HttpClient } from '../http'
import { PATHS } from '../paths'
import type { PlatformDTO, SignInBodyDTO, SignUpBodyDTO, UserWithAuthTokenDTO } from '../types'

export interface GoogleRedirectOptions {
  clientId: string
  redirectUri: string
  // 기본 `openid email profile`. 명시 시 override.
  scope?: string
  state?: string
  // 기본 `code` (Authorization Code flow).
  responseType?: 'code' | 'token'
  // 기본 `online`. Refresh token 필요 시 `offline`.
  accessType?: 'online' | 'offline'
  // `consent` 로 강제 동의 화면 노출 시 매번 refresh_token 발급.
  prompt?: 'none' | 'consent' | 'select_account'
}

export interface GoogleExchangeOptions {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
  // OAuth2 token endpoint override (테스트용).
  tokenEndpoint?: string
}

export interface GoogleExchangeResponse {
  id_token: string
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export interface GoogleSigninOptions {
  // Google ID token (`id_token`) — 서버가 검증.
  idToken: string
  // signin 본문에 동봉되는 email — 서버 측 sign-in 흐름에서 검증·매칭에 사용.
  email: string
  platform?: PlatformDTO
}

export interface GoogleSignupOptions extends GoogleSigninOptions {
  termsVersionIds?: string[]
  marketingConsent?: boolean
  nightMarketingConsent?: boolean
}

const GOOGLE_AUTHZ_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export class GoogleProvider {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  // OAuth redirect URL 구성. 호출자는 window.location.href 또는 NextResponse.redirect 로 이동.
  buildRedirectUrl(opts: GoogleRedirectOptions): string {
    const params = new URLSearchParams({
      client_id: opts.clientId,
      redirect_uri: opts.redirectUri,
      response_type: opts.responseType ?? 'code',
      scope: opts.scope ?? 'openid email profile',
      access_type: opts.accessType ?? 'online',
    })
    if (opts.state) params.set('state', opts.state)
    if (opts.prompt) params.set('prompt', opts.prompt)
    return `${GOOGLE_AUTHZ_ENDPOINT}?${params.toString()}`
  }

  // Authorization Code → token 교환. `clientSecret` 필요 — *서버 측에서만 호출*.
  // RFC 6749 §4.1.3 — Google OAuth2 token endpoint 는 application/x-www-form-urlencoded 가 표준.
  // (JSON 도 historically 동작하지만 documented contract 아님.)
  // fetch 는 HttpClient.fetchImpl 사용 — AuthClient({ fetch }) 주입이 Google 호출까지 일관.
  async exchangeCode(opts: GoogleExchangeOptions): Promise<GoogleExchangeResponse> {
    const endpoint = opts.tokenEndpoint ?? GOOGLE_TOKEN_ENDPOINT
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
        message: 'Failed calling Google token endpoint',
        cause,
      })
    }
    if (!response.ok) {
      throw new AuthError({
        code: 'SDK_PROVIDER_ERROR',
        message: `Google token exchange failed (${response.status})`,
        status: response.status,
      })
    }
    return (await response.json()) as GoogleExchangeResponse
  }

  // ID token → auth-server 세션 발급. `auth.session.persist(res.authToken)` 로 저장.
  signin(opts: GoogleSigninOptions): Promise<UserWithAuthTokenDTO> {
    const body: SignInBodyDTO = {
      provider: 'google',
      email: opts.email,
      token: opts.idToken,
      platform: opts.platform,
    }
    return this.http.request(PATHS[this.http.apiVersion].signin, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  signup(opts: GoogleSignupOptions): Promise<UserWithAuthTokenDTO> {
    const body: SignUpBodyDTO = {
      provider: 'google',
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
