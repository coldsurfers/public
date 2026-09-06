import type { AuthTokenDTO } from '../types'
import { STORAGE_DEFAULTS } from './defaults'
import type { TokenStorage } from './index'

// `expo-secure-store` 의 *구조적* 부분집합. 구체 의존을 피해 RN 외 환경에서도 컴파일.
// consumer 가 `expo-secure-store` 모듈 자체를 주입한다.
export interface SecureStoreLike {
  getItemAsync(key: string, options?: object): Promise<string | null>
  setItemAsync(key: string, value: string, options?: object): Promise<void>
  deleteItemAsync(key: string, options?: object): Promise<void>
}

export interface SecureStoreTokenStorageOptions {
  secureStore: SecureStoreLike
  accessTokenKey?: string
  refreshTokenKey?: string
  // expo-secure-store 의 keychainService·keychainAccessible 등.
  options?: object
}

export class SecureStoreTokenStorage implements TokenStorage {
  private readonly store: SecureStoreLike
  private readonly accessKey: string
  private readonly refreshKey: string
  private readonly options: object | undefined

  constructor(opts: SecureStoreTokenStorageOptions) {
    this.store = opts.secureStore
    this.accessKey = opts.accessTokenKey ?? STORAGE_DEFAULTS.accessTokenKey
    this.refreshKey = opts.refreshTokenKey ?? STORAGE_DEFAULTS.refreshTokenKey
    this.options = opts.options
  }

  async getAccessToken(): Promise<string | null> {
    return this.store.getItemAsync(this.accessKey, this.options)
  }

  async getRefreshToken(): Promise<string | null> {
    return this.store.getItemAsync(this.refreshKey, this.options)
  }

  async setTokens(tokens: AuthTokenDTO): Promise<void> {
    await this.store.setItemAsync(this.accessKey, tokens.accessToken, this.options)
    await this.store.setItemAsync(this.refreshKey, tokens.refreshToken, this.options)
  }

  async clear(): Promise<void> {
    await this.store.deleteItemAsync(this.accessKey, this.options)
    await this.store.deleteItemAsync(this.refreshKey, this.options)
  }
}
