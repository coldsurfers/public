import { AuthError } from '../errors'
import type { AuthTokenDTO } from '../types'
import { STORAGE_DEFAULTS } from './defaults'
import type { TokenStorage } from './index'

export interface LocalStorageTokenStorageOptions {
  accessTokenKey?: string
  refreshTokenKey?: string
  // 테스트·SSR-서버 측에서 globalThis.localStorage 가 없을 때 외부 주입 허용.
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
}

// XSS 노출 트레이드오프. 기본 비권장 — 명시적 선택만.
export class LocalStorageTokenStorage implements TokenStorage {
  private readonly accessKey: string
  private readonly refreshKey: string
  private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

  constructor(options: LocalStorageTokenStorageOptions = {}) {
    this.accessKey = options.accessTokenKey ?? STORAGE_DEFAULTS.accessTokenKey
    this.refreshKey = options.refreshTokenKey ?? STORAGE_DEFAULTS.refreshTokenKey
    const fallback =
      options.storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined)
    if (!fallback) {
      throw new AuthError({
        code: 'SDK_ENV_UNAVAILABLE',
        message:
          'LocalStorageTokenStorage: globalThis.localStorage 가 없습니다. `storage` 옵션으로 주입하세요.',
      })
    }
    this.storage = fallback
  }

  async getAccessToken(): Promise<string | null> {
    return this.storage.getItem(this.accessKey)
  }

  async getRefreshToken(): Promise<string | null> {
    return this.storage.getItem(this.refreshKey)
  }

  async setTokens(tokens: AuthTokenDTO): Promise<void> {
    this.storage.setItem(this.accessKey, tokens.accessToken)
    this.storage.setItem(this.refreshKey, tokens.refreshToken)
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.accessKey)
    this.storage.removeItem(this.refreshKey)
  }
}
