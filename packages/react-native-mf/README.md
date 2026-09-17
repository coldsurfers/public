# @coldsurfers/react-native-mf

React Native 앱이 **원격 번들을 호스트와 같은 JS 런타임에 끼워넣는** 레이어.

미니앱이 새 의존성을 쓸 때마다 호스트를 고쳐 스토어에 다시 올려야 하는 구조를 끊는 것이 목표다.

> 🚧 **Phase 1 · 1.5.** 런타임 · 번들러 플러그인 · 로더(`scriptManager`)가 동작한다. CLI 는 아직
> 계약만 세워져 있다. 로드맵: [coldsurfers/public#85](https://github.com/coldsurfers/public/issues/85)

## 레인

실행 환경이 달라서 진입점을 가른다 — 배럴 하나로 묶으면 RN 앱이 esbuild 를 물게 된다.

| 진입점 | 어디서 도나 | 상태 |
| --- | --- | --- |
| `@coldsurfers/react-native-mf` | 호스트 (React Native) | ✅ shared scope · 원격 레지스트리 · `scriptManager` |
| `@coldsurfers/react-native-mf/esbuild` | 빌드 머신 (Node) | ✅ shared 치환 · self-register |
| `@coldsurfers/react-native-mf/cli` | bin | ⏸ Phase 1 |

`esbuild` 는 optional peer 다. 런타임 레인만 쓰는 앱은 안 깔아도 된다.

## 호스트 배선

호스트가 **자기 사본**을 노출한다. 원격 번들이 `react` 를 자기 안에 번들해 오면 런타임에
React 가 둘이 되어 훅이 깨지는데, 그걸 막는 자리다.

```ts
// index.js — AppRegistry 등록보다 먼저
import { registerShared } from '@coldsurfers/react-native-mf'

registerShared({
  react: require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react-native': require('react-native'),
})
```

키는 **원격 번들이 쓴 specifier 그대로**다 — `react/jsx-runtime` 을 부모 `react` 에서
유도하지 않는다. 원격 번들은 `import` 대신 이 전역을 읽고, 치환은 빌드타임에 `./esbuild`
플러그인이 한다. 그래서 호스트 쪽에 모듈 이름을 손으로 나열하는 화이트리스트가 남지 않는다.

## 미니앱 빌드

빌드 머신에서만 도는 레인이다. 두 조각을 esbuild 옵션에 얹는다.

```ts
import { sharedScopePlugin, withSelfRegister } from '@coldsurfers/react-native-mf/esbuild'

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/index.bundle.js',
  bundle: true,
  plugins: [sharedScopePlugin()],
  ...withSelfRegister({ name: 'settings' }),
})
```

`sharedScopePlugin` 이 shared 이름을 글로벌 참조로 바꾸고, `withSelfRegister` 가
`iife` + footer 로 **실행되면 스스로 등록하는** 번들을 만든다. 산출물엔 `require("react")` 가
남지 않는다.

호스트가 노출하지 않은 이름을 원격 번들이 읽으면 **로드 시점에 던진다.** 조용히 `undefined` 를
넘기면 원격 번들 안에서 터져서 원인이 안 보인다.

## shared 목록은 소비처가 정한다

기본값은 **둘뿐**이다 — `react` · `react-native` (`DEFAULT_SHARED_MODULES`).
RN 마이크로프론트엔드라면 무조건인 것만 남겼다.

어떤 라이브러리를 shared 로 볼지는 **호스트 앱의 사실**이지 이 패키지의 사실이 아니다.
목록은 소비처가 들고 `include` 로 넘긴다.

```ts
sharedScopePlugin({
  include: [...DEFAULT_SHARED_MODULES, 'react-native-reanimated', '@gorhom/bottom-sheet'],
})
```

**규칙은 esbuild 의 `external` 과 같다** — 이름 하나가 그 패키지의 **서브패스까지 덮는다.**
`'react'` 가 `react/jsx-runtime` 을, `'react-native'` 가 `react-native/Libraries/...` 를 함께
잡는다. 형제 패키지는 안 잡는다(`'react'` 는 `react-native` 를 먹지 않는다). 그래서 기존
`external` 목록을 그대로 옮겨오면 된다.

⚠️ **덮는 것과 접는 것은 다르다.** `react/jsx-runtime` 이 치환되면 호스트는 **그 이름으로**
`registerShared` 해야 한다 — 조회 키는 원격 번들이 쓴 specifier 그대로고, 부모 패키지로
접지 않는다. 빠뜨리면 로드 시점에 그 이름을 대며 던진다.

## 회수

**등록되는 값은 모듈 네임스페이스다.** 미니앱이 `export default` 를 쓰면 한 겹 더 들어간다 —
원격 번들이 named export 를 여럿 낼 수 있어서 여기서 `.default` 를 풀지 않는다.

```ts
import { getRemote } from '@coldsurfers/react-native-mf'

const settings = getRemote<{ default: React.FC }>('settings')
const MiniApp = settings?.default
```

아직 실행 전이면 `undefined` 다 — 던지지 않는다. 번들을 실행할지 말지는 로더가 판단하는
자리라, 있는지만 묻고 싶으면 `hasRemote(name)` 을 쓴다.

번들이 실행되면 스스로 등록한다([3] self-register). 실행 방식이 소스 eval 이든 바이트코드든
회수 지점은 이 한 곳이다.

## 로드 — `scriptManager`

`getRemote` 는 **회수** 지점이고, 거기까지 데려오는 일(받기 · 캐시 · 실행)이 `scriptManager` 다.
React 밖이라 부팅 프리페치 · 탭 진입 전 프리로드가 마운트에 묶이지 않는다.

```ts
import { scriptManager } from '@coldsurfers/react-native-mf'

scriptManager.setStorage(storage)

scriptManager.addResolver(async (name) => {
  if (__DEV__) return { url: `http://localhost:8081/${name}.bundle`, cache: false }

  const { latestVersion } = (await getManifest())[name]
  return { url: `${CDN}/${name}/v${latestVersion}/index.bundle.js`, version: latestVersion }
})

const settings = await scriptManager.load<{ default: React.FC }>('settings')
```

**dev/prod 는 resolver 한 자리에서 갈린다.** 채널·롤백도 같은 자리다 — URL 결정이 컴포넌트
계층에 있으면 그게 세 곳으로 흩어진다.

- `load(name)` — **이미 레지스트리에 있으면 재실행하지 않는다.** 두 번째 실행은 미니앱
  top-level 의 `new QueryClient` 를 다시 만든다. 동시에 두 번 불러도 한 번만 받고 한 번만 실행한다
- `prefetch(name)` — 디스크까지만 데운다. **실행하지 않는다** — 실행은 `load` 의 몫이고,
  둘은 같은 다운로드를 접는다
- `invalidate({ keep, name })` — 옛 버전 파일을 지운다. **디스크만** 비운다: 이미 실행된 번들을
  런타임에서 내리는 방법은 없다. 새 버전은 다음 부팅에 실행된다

실패는 기억하지 않는다 — 던진 로드를 다시 부르면 다시 받는다.

## 스토리지는 소비처가 준다

`fetch` 는 이 패키지가 들고, **저장만** 주입받는다. 반대로 갈랐으면 여기가
`react-native-fs` 를 물어야 하는데, 그건 공개 패키지가 소비자에게 네이티브 모듈을 강요하는 것이다.

```ts
import type { ScriptStorage } from '@coldsurfers/react-native-mf'

const storage: ScriptStorage = {
  read: async (key) => (await RNFS.exists(path(key)) ? RNFS.readFile(path(key), 'utf8') : null),
  write: (key, content) => RNFS.writeFile(path(key), content, 'utf8'),
  remove: (key) => RNFS.unlink(path(key)),
  list: async () => (await RNFS.readDir(DIR)).map((entry) => entry.name),
}
```

키는 **불투명 문자열**이다 — 파일 이름 하나로 바꾸기만 하면 된다. 안에 뭐가 들었는지(`name@version`)는
`invalidate` 만 안다. 소비처가 그 규칙을 다시 만들면 규칙이 두 곳으로 갈린다.

읽기·쓰기가 던져도 로드는 안 깨진다 — 캐시는 최적화지 정본이 아니다.
