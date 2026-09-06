import type { ApiVersion } from './types'

// auth-server 의 v1·v2 표면 path 매핑. 변경 시 server route 와 *짝지어* 갱신.
export const PATHS = {
  v1: {
    emailSendCode: '/v1/auth/email/send-auth-code',
    emailConfirmCode: '/v1/auth/email/confirm-auth-code',
    signin: '/v1/auth/signin',
    signup: '/v1/auth/signup',
    refresh: '/v1/auth/reissue-token',
    // v1 에는 check 없음 — 호출 시 SDK_UNKNOWN throw.
    check: null,
    // v1 에는 패스워드리스 로그인 없음 — 호출 시 SDK_NOT_SUPPORTED throw.
    emailPasswordlessLogin: null,
  },
  v2: {
    emailSendCode: '/v2/auth/email/verification-codes',
    emailConfirmCode: '/v2/auth/email/verification-codes/verify',
    signin: '/v2/auth/sessions',
    signup: '/v2/auth/users',
    refresh: '/v2/auth/tokens/refresh',
    check: '/v2/auth/check',
    // 이메일 코드 확인(emailConfirmCode) 직후 호출 — 비밀번호 없이 가입/로그인 완료.
    emailPasswordlessLogin: '/v2/auth/email/sessions',
  },
} as const satisfies Record<ApiVersion, Record<string, string | null>>

// user-identity 는 v1 만 존재.
export const USER_IDENTITY_PATHS = {
  me: '/v1/user/me',
  activate: '/v1/user/activate',
  deactivate: '/v1/user/deactivate',
} as const

// 약관/마케팅 동의 — portal 의 /signup/consent 가 약관 ID 를 받기 위해 호출하는 public surface.
// v1 은 미존재 (auth-server route 가 v2 에만 추가됨).
export const CONSENTS_PATHS = {
  v1: { required: null },
  v2: { required: '/v2/consents/required' },
} as const satisfies Record<ApiVersion, Record<string, string | null>>
