// auth-server (paul-rockstar/apps/coldsurf-auth-server) 의 @coldsurfers/data-models 스키마를 *최소* 미러.
// 본 패키지가 data-models 에 의존하면 consumer 가 transitively 끌고 가야 해서 의도적으로 자체 정의로 시작.
// 서버 측 schema 가 바뀌면 본 파일도 *수동* sync. 후속 카드: `@coldsurfers/auth-models` 공유 패키지 추출 검토.

export type ProviderDTO = 'google' | 'apple' | 'email'
export type PlatformDTO = 'ios' | 'android' | 'web'
export type ApiVersion = 'v1' | 'v2'

export interface AuthTokenDTO {
  accessToken: string
  refreshToken: string
}

export interface UserDTO {
  id: string
  email: string
  provider: string
  handle: string | null
  deactivatedAt: string | null
  meta?: {
    consentRequired: boolean
  }
}

export interface UserWithAuthTokenDTO {
  user: UserDTO
  authToken: AuthTokenDTO
}

export interface SendEmailAuthCodeBodyDTO {
  email: string
}
export interface SendAuthCodeResponseDTO {
  email: string
}

export interface ConfirmAuthCodeBodyDTO {
  email: string
  authCode: string
}
export interface ConfirmAuthCodeResponseDTO {
  email: string
}

export interface SignInBodyDTO {
  provider: ProviderDTO
  email: string
  password?: string
  token?: string
  platform?: PlatformDTO
}

export interface SignUpBodyDTO {
  provider: ProviderDTO
  email: string
  password?: string
  token?: string
  platform?: PlatformDTO
  termsVersionIds?: string[]
  marketingConsent?: boolean
  nightMarketingConsent?: boolean
}

export interface ReissueTokenBodyDTO {
  refreshToken: string
}

export interface CheckUserBodyDTO {
  provider: Exclude<ProviderDTO, 'email'>
  token: string
  platform?: PlatformDTO
}
export interface CheckUserResponseDTO {
  exists: boolean
}

export interface ActivateUserBodyDTO {
  type: 'activate'
  authCode: string
  email: string
}
export interface DeactivateUserBodyDTO {
  type: 'deactivate'
}

export interface ErrorResponseDTO {
  code: string
  message: string
}

// data-models 의 TermsVersionDTO·RequiredConsentsDTO 미러. portal /signup/consent 가
// 약관 ID 를 SDK 로 받기 위해 도입. server schema 변경 시 본 타입도 함께 갱신.
export type TermsTypeDTO = 'SERVICE' | 'PRIVACY'

export interface TermsVersionDTO {
  id: string
  type: TermsTypeDTO
  version: string
  effectiveDate: string
  isActive: boolean
}

export interface RequiredConsentsDTO {
  terms: TermsVersionDTO[]
}
