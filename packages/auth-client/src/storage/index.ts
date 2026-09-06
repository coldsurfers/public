import type { AuthTokenDTO } from '../types'

export interface TokenStorage {
  getAccessToken(): Promise<string | null>
  getRefreshToken(): Promise<string | null>
  setTokens(tokens: AuthTokenDTO): Promise<void>
  clear(): Promise<void>
}

export { type CookieAdapter, type CookieAttributes, CookieTokenStorage } from './cookie'
export { STORAGE_DEFAULTS } from './defaults'
export { LocalStorageTokenStorage } from './local-storage'
export { MemoryTokenStorage } from './memory'
export { type SecureStoreLike, SecureStoreTokenStorage } from './secure-store'
