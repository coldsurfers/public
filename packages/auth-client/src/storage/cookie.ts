import { AuthError } from '../errors'
import type { AuthTokenDTO } from '../types'
import { STORAGE_DEFAULTS } from './defaults'
import type { TokenStorage } from './index'

export interface CookieAttributes {
  domain?: string
  path?: string
  // 초 단위. 미지정 시 세션 쿠키 (브라우저 종료 시 삭제).
  maxAge?: number
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  // httpOnly 는 클라이언트-사이드 document.cookie 로는 *설정 불가*.
  // 서버-사이드 쿠키 매니저 (Next.js cookies()) 를 쓰려면 `adapter` 옵션으로 주입.
  httpOnly?: boolean
}

export interface CookieAdapter {
  get(name: string): string | null
  set(name: string, value: string, attrs: CookieAttributes): void
  remove(name: string, attrs: CookieAttributes): void
}

export interface CookieTokenStorageOptions {
  accessTokenKey?: string
  refreshTokenKey?: string
  attributes?: CookieAttributes
  // 미지정 시 `document.cookie` 어댑터 사용 — 브라우저 컨텍스트만.
  // Next.js Route Handler / Server Action 에서는 cookies() 기반 어댑터 주입.
  adapter?: CookieAdapter
}

// Next.js / 브라우저용. domain·path·sameSite 등은 attributes 로.
export class CookieTokenStorage implements TokenStorage {
  private readonly accessKey: string
  private readonly refreshKey: string
  private readonly attrs: CookieAttributes
  private readonly adapter: CookieAdapter

  constructor(options: CookieTokenStorageOptions = {}) {
    this.accessKey = options.accessTokenKey ?? STORAGE_DEFAULTS.accessTokenKey
    this.refreshKey = options.refreshTokenKey ?? STORAGE_DEFAULTS.refreshTokenKey
    this.attrs = {
      path: '/',
      secure: true,
      sameSite: 'lax',
      ...options.attributes,
    }
    this.adapter = options.adapter ?? createDocumentCookieAdapter()
  }

  async getAccessToken(): Promise<string | null> {
    return this.adapter.get(this.accessKey)
  }

  async getRefreshToken(): Promise<string | null> {
    return this.adapter.get(this.refreshKey)
  }

  async setTokens(tokens: AuthTokenDTO): Promise<void> {
    this.adapter.set(this.accessKey, tokens.accessToken, this.attrs)
    this.adapter.set(this.refreshKey, tokens.refreshToken, this.attrs)
  }

  async clear(): Promise<void> {
    this.adapter.remove(this.accessKey, this.attrs)
    this.adapter.remove(this.refreshKey, this.attrs)
  }
}

// `document.cookie` 직접 조작. SSR 환경에서는 throw — 그 경우 adapter 주입을 요구.
function createDocumentCookieAdapter(): CookieAdapter {
  return {
    get(name) {
      if (typeof document === 'undefined') {
        throw new AuthError({
          code: 'SDK_ENV_UNAVAILABLE',
          message:
            'CookieTokenStorage: document 가 없습니다. SSR 컨텍스트면 `adapter` 옵션을 주입하세요.',
        })
      }
      const prefix = `${encodeURIComponent(name)}=`
      const match = document.cookie.split('; ').find((row) => row.startsWith(prefix))
      return match ? decodeURIComponent(match.slice(prefix.length)) : null
    },
    set(name, value, attrs) {
      if (typeof document === 'undefined') {
        throw new AuthError({
          code: 'SDK_ENV_UNAVAILABLE',
          message:
            'CookieTokenStorage: document 가 없습니다. SSR 컨텍스트면 `adapter` 옵션을 주입하세요.',
        })
      }
      document.cookie = serializeCookie(name, value, attrs)
    },
    remove(name, attrs) {
      if (typeof document === 'undefined') return
      document.cookie = serializeCookie(name, '', { ...attrs, maxAge: 0 })
    },
  }
}

function serializeCookie(name: string, value: string, attrs: CookieAttributes): string {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]
  if (attrs.path) parts.push(`Path=${attrs.path}`)
  if (attrs.domain) parts.push(`Domain=${attrs.domain}`)
  if (typeof attrs.maxAge === 'number') parts.push(`Max-Age=${attrs.maxAge}`)
  if (attrs.secure) parts.push('Secure')
  if (attrs.sameSite) parts.push(`SameSite=${capitalize(attrs.sameSite)}`)
  if (attrs.httpOnly) parts.push('HttpOnly')
  return parts.join('; ')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
