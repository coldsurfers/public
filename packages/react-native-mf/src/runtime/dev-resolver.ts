import { devBundleUrl } from '../dev-address'
import type { ScriptResolver } from './script-manager'

export type DevResolverOptions = {
  /** 기기에서 본 개발 머신. iOS 시뮬레이터는 `localhost`, Android 에뮬레이터는 `10.0.2.2` */
  hostname: string
  /** `react-native-mf dev` 를 띄운 미니앱의 config `name`. 나머지는 다음 resolver 로 넘긴다 */
  names: readonly string[]
}

/**
 * `react-native-mf dev` 가 요청마다 굽는 번들을 받는다. 버전이 없으니 캐시하지 않는다.
 *
 * 주소는 만들 때 다 푼다. 경로 한 칸에 못 쓰는 이름이면 첫 로드가 아니라 부팅에서 던진다.
 */
export function createDevResolver({ hostname, names }: DevResolverOptions): ScriptResolver {
  const urls = new Map(names.map((name) => [name, devBundleUrl(hostname, name)]))
  return (name) => {
    const url = urls.get(name)
    return url === undefined ? undefined : { url, cache: false }
  }
}
