import type { AuthTokenDTO } from '../types'
import type { TokenStorage } from './index'

// 테스트·SSR-잠시 보관 용도. 프로세스 종료 시 휘발.
export class MemoryTokenStorage implements TokenStorage {
  private tokens: AuthTokenDTO | null = null

  async getAccessToken(): Promise<string | null> {
    return this.tokens?.accessToken ?? null
  }

  async getRefreshToken(): Promise<string | null> {
    return this.tokens?.refreshToken ?? null
  }

  async setTokens(tokens: AuthTokenDTO): Promise<void> {
    this.tokens = tokens
  }

  async clear(): Promise<void> {
    this.tokens = null
  }
}
