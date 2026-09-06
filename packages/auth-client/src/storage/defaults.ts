// 4 adapter 가 공유하는 기본 키. 키 정책 변경 시 1곳만 수정.
export const STORAGE_DEFAULTS = {
  accessTokenKey: 'cs_access_token',
  refreshTokenKey: 'cs_refresh_token',
} as const
