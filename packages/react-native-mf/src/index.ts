/**
 * 런타임 레인 — 호스트(React Native) 안에서 도는 것만 여기 있다.
 *
 * 번들러 플러그인은 `@coldsurfers/react-native-mf/esbuild` 에 있다. 실행 환경이 달라서
 * 가른 것이다 — 앱이 esbuild 를 물면 안 된다.
 */

export {
  getRemote,
  hasRemote,
  REMOTE_REGISTRY_KEY,
  registerRemote,
  remoteNames,
} from './runtime/registry'
export {
  getShared,
  hasShared,
  registerShared,
  SHARED_SCOPE_KEY,
  sharedNames,
} from './runtime/shared-scope'
