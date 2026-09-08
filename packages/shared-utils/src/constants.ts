/**
 * COLDSURF 서비스 상수 — 앱 스토어·SNS·웹 URL.
 *
 * 표면마다 각자 문자열을 들고 있으면 앱 링크 하나 바뀔 때 어디가 남았는지 알 수 없다.
 * 값이 바뀌는 일이 드물수록 사본이 조용히 갈라진다.
 */

export const SERVICE_NAME = 'COLDSURF'

export const COLDSURF_WEB_URL = 'https://coldsurf.io'

export const APP_STORE_ID = '1632802589' as const
export const APP_STORE_URL =
  `https://apps.apple.com/kr/app/coldsurf-%EA%B3%B5%EC%97%B0-%EC%B6%94%EC%B2%9C-%ED%8B%B0%EC%BC%93-%EC%B6%94%EC%B2%9C-%EC%84%9C%EB%B9%84%EC%8A%A4/id${APP_STORE_ID}` as const

export const PLAYSTORE_PACKAGE = 'com.fstvllife.android' as const
export const PLAYSTORE_URL =
  'https://play.google.com/store/apps/details?id=com.fstvllife.android' as const
export const PLAYSTORE_APP_NAME = 'COLDSURF' as const

export const SNS_LINKS = {
  INSTAGRAM: 'https://www.instagram.com/coldsurf.io',
  X: 'https://x.com/coldsurf_io',
} as const
