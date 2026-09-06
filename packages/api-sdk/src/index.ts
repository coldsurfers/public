// 진입점 `.` — **런타임으로 react·react-query 를 물지 않는다.**
// 타입 하나 쓰려는 소비자(문서 사이트·서버 스크립트)가 UI 런타임까지 지게 하지 않으려는 경계다.
// react 계열은 `./react`, 도메인 훅은 `./queries` 로 간다.

export {
  ApiSdk,
  type FetchOptions,
  getApiClient,
  type NotificationFeedEntityType,
} from './api-sdk'
export { OpenApiError } from './error'
export * from './types/api.gen'
export * from './types/api-client.types'
