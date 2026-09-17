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

**배선과 로드는 시점이 다르다.** 배선은 부팅에 한 번, 로드는 화면이 필요할 때다. 한 블록처럼
보이면 resolver 를 컴포넌트 안에서 등록하게 되고, 그러면 마운트마다 resolver 가 쌓인다.

### 이름 하나가 넷을 잇는다

미니앱을 "꽂는다" 는 건 **같은 문자열을 네 자리에 두는 것**이다. 그 외에 호스트가 미니앱을
아는 방법은 없다 — import 도, 등록 테이블도 없다.

| 자리 | 코드 | 누가 |
| --- | --- | --- |
| 미니앱 빌드 | `withSelfRegister({ name: 'settings' })` | 미니앱 CI |
| 번들 footer 의 자기등록 | `registerRemote('settings', ns)` | 번들이 실행되며 스스로 |
| resolver 가 받는 인자 | `(name) => name === 'settings' ? {...} : undefined` | 호스트 부팅 |
| 화면 | `useRemote('settings')` | 호스트 화면 |

어긋나면 **번들은 받아지고 실행도 되는데 회수에서 던진다.** 그 에러가 이름을 대준다
(`실행한 번들이 "settings" 으로 등록되지 않았다`).

### 끝까지 한 번 — settings 미니앱

**① 미니앱**: 평범한 RN 컴포넌트다. 호스트를 모른다.

```tsx
// settings-mini-app/src/index.tsx
export default function SettingsApp(props: Props) { ... }
```

```ts
// settings-mini-app/build.mjs
await esbuild.build({
  entryPoints: ['src/index.tsx'],
  outfile: `dist/v${version}/index.bundle.js`,
  bundle: true,
  plugins: [sharedScopePlugin({ include: SHARED_MODULES })],
  ...withSelfRegister({ name: 'settings' }),
})
```

**② 올리기**: 산출물은 `dist/v1.1.2/index.bundle.js` 하나. 버전을 **경로에** 두고, 어느 버전이
최신인지는 호스트가 매니페스트로 묻는다.

```json
{ "settings": { "latestVersion": "1.1.2" } }
```

경로에 버전이 있어야 롤백이 배포가 아니라 **매니페스트 한 줄**이 된다.

**③ 호스트 부팅**: 이름 하나를 URL 로 바꾸는 자리 — 아래 `1. 부팅에 한 번` 의 resolver 다.

**④ 화면**: `useRemote('settings')`. 여기서 미니앱이 처음 실행된다.

**⑤ 새 버전**: 매니페스트가 `1.1.3` 을 가리키면 resolver 가 새 URL·새 캐시 키를 준다.
**이미 실행된 번들은 이번 세션에서 안 바뀐다** — JS 런타임에 올라간 모듈을 내리는 방법이 없다.
다음 부팅에 `1.1.3` 이 뜨고, 그때 `invalidate({ keep: ['1.1.3'], name: 'settings' })` 로 옛 파일을 지운다.

### 1. 부팅에 한 번 — 배선

`index.js`, `registerShared` 옆자리. React 트리 **밖**이다.

```ts
import { registerShared, scriptManager } from '@coldsurfers/react-native-mf'

registerShared(SHARED_MODULES)
scriptManager.setStorage(storage)

scriptManager.addResolver(async (name) => {
  if (__DEV__) return { url: `http://localhost:8081/${name}.bundle`, cache: false }

  const { latestVersion } = (await getManifest())[name]
  return { url: `${CDN}/${name}/v${latestVersion}/index.bundle.js`, version: latestVersion }
})
```

**dev/prod 는 resolver 한 자리에서 갈린다.** 채널·롤백도 같은 자리다 — URL 결정이 컴포넌트
계층에 있으면 그게 세 곳으로 흩어진다.

resolver 는 `await` 를 품어도 된다(위의 `getManifest`). 부팅에서 등록만 하고 **실제 호출은
첫 `load` 때**라, 배선이 네트워크를 기다리지 않는다.

### 2. 화면에서 — Suspense

`load` 는 약속을, `getRemote` 는 값을 돌려준다. 그 둘을 Suspense 계약으로 접은 게 `useRemote` 다.

```tsx
import { useRemote } from '@coldsurfers/react-native-mf'

function SettingsScreen(props: Props) {
  const { default: MiniApp } = useRemote<{ default: FC<Props> }>('settings')

  return <MiniApp {...props} />
}
```

```tsx
<ErrorBoundary fallback={<LoadFailed />}>
  <Suspense fallback={<Spinner />}>
    <SettingsScreen />
  </Suspense>
</ErrorBoundary>
```

로딩·에러 상태를 손으로 들 자리가 사라진다 — 상태 셋(`loading`/`error`/`data`)이 Suspense
경계와 ErrorBoundary 로 옮겨간다. 재시도도 ErrorBoundary 가 든다: **실패는 기억되지 않아서**
다시 렌더하면 다시 받는다.

> **이 훅은 `react` 를 import 하지 않는다.** 훅 API 를 하나도 부르지 않기 때문이다 — 하는 일은
> "있으면 값, 없으면 약속을 던진다" 뿐이고 그걸 받는 건 React 쪽이다. 그래서 런타임 레인은
> 여전히 React 를 모르고, peer 도 늘지 않는다.

네 줄짜리라 소비처에서 다시 쓰기 쉬운데, 그 네 줄이 로더 내부에 기대고 있어서 패키지가 든다.
**동기 조회가 먼저**여야 이미 실행된 번들을 다시 안 받고, **약속을 그대로 던져야** `load` 의
in-flight 접기가 살아 있다. `useState`/`useEffect` 로 감싸면 그 보장이 깨져 번들이 두 번 실행된다.

### 3. 그 사이 — 프리페치

화면이 필요해지기 전에 디스크를 데운다. 탭 진입 직전이나 부팅 유휴 시간.

```ts
requestIdleCallback(() => {
  scriptManager.prefetch('settings')
})
```

`prefetch` 와 `load` 는 **같은 다운로드를 접는다** — 프리페치 중에 화면이 열려도 두 번 받지 않는다.

### 표면 셋

- `load(name)` — **이미 레지스트리에 있으면 재실행하지 않는다.** 두 번째 실행은 미니앱
  top-level 의 `new QueryClient` 를 다시 만든다. 동시에 두 번 불러도 한 번만 받고 한 번만 실행한다
- `prefetch(name)` — 디스크까지만 데운다. **실행하지 않는다** — 실행은 미니앱 top-level 을 도는
  일이라 이 이름 뒤에 숨기지 않는다
- `invalidate({ keep, name })` — 옛 버전 파일을 지운다. **디스크만** 비운다: 이미 실행된 번들을
  런타임에서 내리는 방법은 없다. 새 버전은 다음 부팅에 실행된다

실패는 기억하지 않는다 — 던진 로드를 다시 부르면 다시 받는다. ErrorBoundary 의 재시도가
그대로 먹는다는 뜻이다. **단, 이미 실행된 번들의 교체는 재시도로 안 된다**(위 `invalidate`).

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
