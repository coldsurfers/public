import { AuthError } from '../errors'
import type { HttpClient } from '../http'
import { PATHS } from '../paths'
import type {
  ConfirmAuthCodeBodyDTO,
  ConfirmAuthCodeResponseDTO,
  SendAuthCodeResponseDTO,
  SendEmailAuthCodeBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  UserWithAuthTokenDTO,
} from '../types'

export class EmailProvider {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  sendCode(body: SendEmailAuthCodeBodyDTO): Promise<SendAuthCodeResponseDTO> {
    return this.http.request(PATHS[this.http.apiVersion].emailSendCode, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  confirmCode(body: ConfirmAuthCodeBodyDTO): Promise<ConfirmAuthCodeResponseDTO> {
    return this.http.request(PATHS[this.http.apiVersion].emailConfirmCode, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  signin(body: Omit<SignInBodyDTO, 'provider'>): Promise<UserWithAuthTokenDTO> {
    return this.http.request(PATHS[this.http.apiVersion].signin, {
      method: 'POST',
      body: JSON.stringify({ ...body, provider: 'email' } satisfies SignInBodyDTO),
    })
  }

  signup(body: Omit<SignUpBodyDTO, 'provider'>): Promise<UserWithAuthTokenDTO> {
    return this.http.request(PATHS[this.http.apiVersion].signup, {
      method: 'POST',
      body: JSON.stringify({ ...body, provider: 'email' } satisfies SignUpBodyDTO),
    })
  }

  // `confirmCode` 로 이메일 소유권 검증이 끝난 직후 호출 — 비밀번호 없이 가입(신규)/로그인(기존)
  // 을 한 번에 완료한다. `signin`/`signup` 의 email provider 분기는 비밀번호가 필수라 이 흐름과
  // 별개 — v2 전용.
  passwordlessLogin(body: ConfirmAuthCodeBodyDTO): Promise<UserWithAuthTokenDTO> {
    const path = PATHS[this.http.apiVersion].emailPasswordlessLogin
    if (!path) {
      throw new AuthError({
        code: 'SDK_NOT_SUPPORTED',
        message: `email.passwordlessLogin 은 v2 에서만 지원합니다 (현재: ${this.http.apiVersion}).`,
      })
    }
    return this.http.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}
