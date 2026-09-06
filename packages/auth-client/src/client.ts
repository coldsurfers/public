import { AuthError } from './errors'
import { HttpClient } from './http'
import { CONSENTS_PATHS, PATHS, USER_IDENTITY_PATHS } from './paths'
import { AppleProvider } from './providers/apple'
import { EmailProvider } from './providers/email'
import { GoogleProvider } from './providers/google'
import type { TokenStorage } from './storage/index'
import type {
  ActivateUserBodyDTO,
  ApiVersion,
  AuthTokenDTO,
  CheckUserBodyDTO,
  CheckUserResponseDTO,
  DeactivateUserBodyDTO,
  RequiredConsentsDTO,
  UserDTO,
} from './types'

export interface AuthClientOptions {
  // 예: 'https://auth.coldsurf.io' — 끝의 슬래시 자동 제거.
  baseUrl: string
  storage: TokenStorage
  // 기본 v2. 일부 consumer (billets-app 의 일부 화면) 가 v1 잔존이면 v1 지정.
  apiVersion?: ApiVersion
  // 테스트·서버 환경에서 globalThis.fetch 가 없을 때 주입.
  fetch?: typeof fetch
  defaultHeaders?: HeadersInit
}

export class AuthClient {
  readonly http: HttpClient
  readonly storage: TokenStorage
  readonly email: EmailProvider
  readonly google: GoogleProvider
  readonly apple: AppleProvider
  readonly session: SessionHelper
  readonly user: UserIdentityHelper
  readonly consents: ConsentsHelper

  constructor(options: AuthClientOptions) {
    const apiVersion = options.apiVersion ?? 'v2'
    this.storage = options.storage
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      apiVersion,
      storage: options.storage,
      fetch: options.fetch,
      defaultHeaders: options.defaultHeaders,
    })
    this.email = new EmailProvider(this.http)
    this.google = new GoogleProvider(this.http)
    this.apple = new AppleProvider(this.http)
    this.session = new SessionHelper(this.http, this.storage)
    this.user = new UserIdentityHelper(this.http)
    this.consents = new ConsentsHelper(this.http)
  }
}

export class SessionHelper {
  private readonly http: HttpClient
  private readonly storage: TokenStorage

  constructor(http: HttpClient, storage: TokenStorage) {
    this.http = http
    this.storage = storage
  }

  // sign-in/sign-up 응답의 authToken 을 storage 에 저장. consumer 의 호출 자리 1 줄로 축약.
  async persist(authToken: AuthTokenDTO): Promise<void> {
    await this.storage.setTokens(authToken)
  }

  async clear(): Promise<void> {
    await this.storage.clear()
  }

  async getAccessToken(): Promise<string | null> {
    return this.storage.getAccessToken()
  }

  // 다른 서버(billets API) 의 401 을 받은 호출자가 재발급만 트리거할 때.
  // HttpClient 의 `refreshInFlight` 를 공유하므로 동시에 몇 번을 불러도 요청은 한 번이다.
  // 성공 시 새 토큰이 storage 에 이미 저장돼 있어 `persist` 를 따로 부를 필요가 없다.
  refresh(): Promise<AuthTokenDTO> {
    return this.http.refresh()
  }

  // v2 전용 — 동일 (provider, token) 으로 가입 이력 있는지 사전 확인.
  async check(body: CheckUserBodyDTO): Promise<CheckUserResponseDTO> {
    const path = PATHS[this.http.apiVersion].check
    if (!path) {
      throw new AuthError({
        code: 'SDK_NOT_SUPPORTED',
        message: `auth.session.check 는 v2 에서만 지원합니다 (현재: ${this.http.apiVersion}).`,
      })
    }
    return this.http.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

export class ConsentsHelper {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  // 활성 약관 (서비스/개인정보) 목록. portal 의 /signup/consent 가 신규 가입자에게
  // 표시할 약관 ID 를 받는 표면. 인증 불필요.
  getRequired(): Promise<RequiredConsentsDTO> {
    const path = CONSENTS_PATHS[this.http.apiVersion].required
    if (!path) {
      throw new AuthError({
        code: 'SDK_NOT_SUPPORTED',
        message: `consents.getRequired 는 v2 에서만 지원합니다 (현재: ${this.http.apiVersion}).`,
      })
    }
    return this.http.request(path, { method: 'GET' })
  }
}

export class UserIdentityHelper {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  me(): Promise<UserDTO> {
    return this.http.request(USER_IDENTITY_PATHS.me, { method: 'GET' }, { auth: true })
  }

  activate(body: ActivateUserBodyDTO): Promise<UserDTO> {
    return this.http.request(
      USER_IDENTITY_PATHS.activate,
      { method: 'PATCH', body: JSON.stringify(body) },
      { auth: true },
    )
  }

  deactivate(body: DeactivateUserBodyDTO): Promise<UserDTO> {
    return this.http.request(
      USER_IDENTITY_PATHS.deactivate,
      { method: 'DELETE', body: JSON.stringify(body) },
      { auth: true },
    )
  }
}
