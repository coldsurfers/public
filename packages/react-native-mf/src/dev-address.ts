/**
 * `react-native-mf dev` 의 주소. dev 서버(Node)와 호스트의 `createDevResolver`(RN)가 같이 물어서
 * node 빌트인을 쓰지 않는다(`manifest.ts` 와 같은 규칙).
 *
 * ```
 * http://{hostname}:8082/{name}/index.bundle.js
 * ```
 *
 * **config 로 열지 않는다.** 호스트는 미니앱의 Node config 를 런타임에 못 읽어서, 여는 순간 호스트에
 * 사본이 생긴다. 호스트와 미니앱은 이 패키지를 따로 깔아 버전이 갈릴 수 있다. 그래서 포트나 경로
 * 모양을 바꾸면 major 다.
 */
import { BUNDLE_FILE, segment } from './manifest'

export const DEV_PORT = 8082

/** `/settings/index.bundle.js`. 이름이 경로 한 칸 규칙에 안 맞으면 던진다(저장소 키와 같은 규칙) */
export function devBundlePath(name: string): string {
  return `/${segment(name, 'name')}/${BUNDLE_FILE}`
}

/** 서버 배너와 호스트 resolver 가 이 함수 하나로 주소를 만든다 */
export function devBundleUrl(hostname: string, name: string): string {
  return `http://${hostname}:${DEV_PORT}${devBundlePath(name)}`
}
