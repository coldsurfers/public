import type { ErrorResponseDTO } from './types'

// SDK-내부 오류 코드. server 의 `code` 와 충돌하지 않도록 `SDK_` 접두 사용.
export type SdkErrorCode =
  | 'SDK_NETWORK_ERROR'
  | 'SDK_REFRESH_FAILED'
  | 'SDK_NO_REFRESH_TOKEN'
  | 'SDK_UNAUTHORIZED'
  | 'SDK_NOT_SUPPORTED' // 현재 apiVersion 에서 미지원 (예: v1 의 check)
  | 'SDK_ENV_UNAVAILABLE' // SSR 컨텍스트에서 document/localStorage 없음, fetch 없음 등
  | 'SDK_PROVIDER_ERROR' // Google/Apple 등 외부 OAuth provider 호출 실패
  | 'SDK_UNKNOWN'

export type AuthErrorCode = SdkErrorCode | (string & {})

export class AuthError extends Error {
  readonly code: AuthErrorCode
  readonly status?: number
  readonly response?: ErrorResponseDTO

  constructor(args: {
    code: AuthErrorCode
    message: string
    status?: number
    response?: ErrorResponseDTO
    cause?: unknown
  }) {
    super(args.message, { cause: args.cause })
    this.name = 'AuthError'
    this.code = args.code
    this.status = args.status
    this.response = args.response
  }
}
