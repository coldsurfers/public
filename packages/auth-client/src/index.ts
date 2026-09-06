// Public surface — semver 보장 영역. 내부 helper (HttpClient 등) 도 import 하는 consumer 가 있을 수 있어 노출.
export {
  AuthClient,
  type AuthClientOptions,
  ConsentsHelper,
  SessionHelper,
  UserIdentityHelper,
} from './client'
export { AuthError, type AuthErrorCode, type SdkErrorCode } from './errors'
export { HttpClient, type HttpClientOptions, type RequestOptions } from './http'
export { CONSENTS_PATHS, PATHS, USER_IDENTITY_PATHS } from './paths'
export {
  type AppleExchangeOptions,
  type AppleExchangeResponse,
  AppleProvider,
  type AppleRedirectOptions,
  type AppleSigninOptions,
  type AppleSignupOptions,
} from './providers/apple'

export { EmailProvider } from './providers/email'
export {
  type GoogleExchangeOptions,
  type GoogleExchangeResponse,
  GoogleProvider,
  type GoogleRedirectOptions,
  type GoogleSigninOptions,
  type GoogleSignupOptions,
} from './providers/google'
export {
  type CookieAdapter,
  type CookieAttributes,
  CookieTokenStorage,
  LocalStorageTokenStorage,
  MemoryTokenStorage,
  type SecureStoreLike,
  SecureStoreTokenStorage,
  STORAGE_DEFAULTS,
  type TokenStorage,
} from './storage/index'

export type {
  ActivateUserBodyDTO,
  ApiVersion,
  AuthTokenDTO,
  CheckUserBodyDTO,
  CheckUserResponseDTO,
  ConfirmAuthCodeBodyDTO,
  ConfirmAuthCodeResponseDTO,
  DeactivateUserBodyDTO,
  ErrorResponseDTO,
  PlatformDTO,
  ProviderDTO,
  ReissueTokenBodyDTO,
  RequiredConsentsDTO,
  SendAuthCodeResponseDTO,
  SendEmailAuthCodeBodyDTO,
  SignInBodyDTO,
  SignUpBodyDTO,
  TermsTypeDTO,
  TermsVersionDTO,
  UserDTO,
  UserWithAuthTokenDTO,
} from './types'
