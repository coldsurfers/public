/**
 * 빌드타임 레인 — 빌드 머신(Node)에서만 돈다. RN 번들에 들어가지 않는다.
 *
 * `esbuild` 는 optional peer 다. 이 진입점을 여는 소비자만 깔면 된다.
 */

export { type RegisterOptions, withSelfRegister } from './register'
export {
  DEFAULT_SHARED_MODULES,
  type SharedScopePluginOptions,
  sharedScopePlugin,
} from './shared-scope'
