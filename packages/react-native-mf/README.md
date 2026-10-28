# @coldsurfers/react-native-mf

React Native 앱에 **원격 미니앱을 붙이는 프레임워크**.

미니앱을 굽고 · 띄우고 · 올리고 · 되돌리는 CLI 와, 호스트가 그 번들을 받아 같은 JS 런타임에서 실행하는
런타임을 한 패키지로 낸다. 미니앱이 바뀌어도 호스트를 스토어에 다시 올리지 않고, React 와 `react-native` 는
호스트의 사본 하나를 같이 쓴다.

목표는 미니앱 하나를 붙일 때 **호스트와 미니앱이 손으로 쓰는 배선을 config 한 장과 몇 줄로 줄이는 것**이다.

> 🚧 빌드 · 배포 · 로드는 끝까지 돌고, billets-app 스토어 빌드에서 설정 화면 미니앱 하나가 이 경로로 돈다.
> 남은 일은 소비처가 아직 손으로 쓰는 배선을 가져오는 것이다. 로드맵 정본은 [coldsurfers/public#85](https://github.com/coldsurfers/public/issues/85).

## 지금 어디까지 왔나

2026-10-28 기준 한 장 요약이다. 어긋나면 #85 가 맞다.

### 진척은 손배선 줄 수로 잰다

billets-app 과 settings-mini-app 이 이 패키지 밖에서 손으로 쓰는 코드다. 줄 수는 `wc -l` 로 셌다.

| 손으로 쓰는 것 | 줄 | 프레임워크가 낼 것 | 상태 |
| --- | --- | --- | --- |
| 미니앱 빌드 · 배포 스크립트 (옛 `react-native-esbuild-deploy` 21파일) | 0 | `build` · `deploy` · `rollback` · `promote` | ✅ |
| dev 번들 서버 `scripts/serve-bundle.mjs` | 51 | `react-native-mf dev` | ⬜ |
| 호스트 부팅 배선 `setup-remote-apps.ts` (dev/prod 분기 · 개발 메뉴 · resolver) | 75 | 호스트 프리셋 | ⬜ |
| shared 목록 추출 · 검사 `scripts/extract-shared-modules.mjs` | 60 | CLI 명령 · Metro 헬퍼 | ⬜ |
| 캐시 저장소 `script-storage.ts` (RNFS) | 39 | 저장소 어댑터 | ⬜ 선택 |

지금 남은 손배선은 225줄이다. 그 밖에 shared 목록 자체(`shared-modules.ts`)와 Metro 설정 일부가 있다.
결합의 예로, dev 서버 포트 `8082` 가 미니앱 서버와 호스트 배선에 따로 적혀 있다. 패키지 상수 하나(`dev` · `createDevResolver`)가 이 둘을 대신한다.

### 기반은 섰다

| 줄기 | 한 일 | 상태 |
| --- | --- | --- |
| 빌드 (Phase 1) | shared 를 전역 참조로 바꿔치기 · self-register · `build` CLI. 호스트 손목록 `requireFn` 25개를 0개로 | ✅ 0.2.0 · 0.4.0 |
| 로드 (Phase 1.5) | `scriptManager` 의 resolver · 캐시 · 중복 실행 막기, React 바인딩 `useRemote` | ✅ 0.3.0 |
| 배포 (Phase 1.6) | CDN 정적 매니페스트 · 채널 · `deploy` · `rollback` · `promote` | ✅ 0.5.0 · 0.6.0 |
| 호스트 배선 | dev `local` 모드([surfers-root#1319](https://github.com/coldsurfers/surfers-root/pull/1319)) · Metro 가 shared 를 한 벌로 풀게 한 수정([surfers-root#1320](https://github.com/coldsurfers/surfers-root/pull/1320)) | ✅ |
| 바이트코드 (Phase 0 · 2 · 3 · 5) | hermesc 와 네이티브 로더로 `new Function` 을 대체 | ⏸ 보류 |

### 다음은 손배선을 위 표의 순서로 가져온다 (Phase F)

1. `react-native-mf dev`. `serve-bundle.mjs` 를 흡수한다. 포트와 경로는 패키지 상수라 호스트는 `createDevResolver` 로 받는다
2. 호스트 프리셋. dev/prod 분기 · 개발 메뉴 · resolver 를 한 호출로 묶는다. MMKV 처럼 앱마다 다른 의존은 주입받는다
3. shared 목록 추출 · 검사를 CLI 명령으로, Metro 의 shared 해석을 헬퍼로 낸다
4. 저장소 어댑터. 선택이다

`dev` 에는 HMR 을 얹었다([#324](https://github.com/coldsurfers/public/pull/324) · [#325](https://github.com/coldsurfers/public/pull/325) · [#326](https://github.com/coldsurfers/public/pull/326)).
저장하면 바뀐 모듈만 기기에서 갈아 끼운다. 쓰는 법과 한계는 [아래](#저장하면-바뀐-모듈만-갈아-끼운다)에 있다.

아무도 안 쓰는 기능(여러 미니앱 조율)은 먼저 만들지 않는다. 미니앱마다 포트를 따로 여는 dev 서버도 여기 든다.
두 번째 미니앱이 어느 레포에 사는지 정해지면 다시 본다.

### 남은 검증과 판정

**검증.**

- [ ] shared 싱글턴을 릴리즈 빌드 · Android · bottom-sheet 같은 위층 라이브러리에서 확인한다. 지금은 iOS Debug 에서만 확인했다

**판정.** 실험으로 정해지지 않아서 사람이 고른다.

- [x] re.pack 으로 갈아타지 않는다(2026-10-27, #85 미결 2). 쓰는 기능(shared 한 벌 · 원격 번들 로드 · 배포 채널)에 비해 너무 크다. 호스트 번들러는 Metro 그대로 두고 미니앱만 esbuild 로 굽는다
- [ ] 미니앱 배포 CI 를 둘지. 지금은 미니앱 레포에서 로컬로 `deploy -i` 를 부른다
- [ ] 서버 매니페스트 라우트와 `RemoteAppManifestDTO` 를 지울지. 앱은 더는 읽지 않는다
- [ ] Phase 4 OTA 결합을 닫을지. 채널은 이미 hot-updater 채널을 따른다

### 바이트코드는 보류했다

바이트코드로 아끼는 건 설정 화면에 들어갈 때 기기에서 하는 컴파일 한 번이고, 콜드 4.8ms 였다(iPhone 17 Pro 시뮬레이터 실측).
그 대가는 네이티브 모듈 두 벌, Hermes 버전에 묶인 배포, gzip 기준 2.2배 다운로드다. 값이 안 맞아서 접었다.
측정과 근거는 [결정 댓글](https://github.com/coldsurfers/public/issues/85#issuecomment-6432756280)에 있다.

다시 여는 조건은 셋이다.

- 미니앱 번들이 100 kB 를 넘는다
- 미니앱이 앱 기동 경로에 올라간다
- 실기기에서 잰 콜드 컴파일이 16ms 를 넘는다

## 설치

GitHub Packages 에 발행된다. 레지스트리 설정(`.npmrc`)은 [루트 README](../../README.md#쓰기) 를 따른다.

```bash
# 호스트 앱 — 런타임만 쓴다
pnpm add @coldsurfers/react-native-mf

# 미니앱 — build · deploy 를 부른다
pnpm add -D @coldsurfers/react-native-mf esbuild @babel/core @babel/plugin-transform-block-scoping @aws-sdk/client-s3
```

peer 넷은 전부 **optional** 이다. 호스트 앱은 하나도 안 깔아도 되고, CLI 는 명령을 실제로 부를 때 연다.

| peer | 필요한 때 |
| --- | --- |
| `esbuild` | `build` · `dev` · `deploy` · `./esbuild` 직접 호출 |
| `@babel/core` · `@babel/plugin-transform-block-scoping` | `build` · `dev` · `deploy` |
| `@aws-sdk/client-s3` | `s3Storage` 로 올릴 때 |

## 사용원리

### 한 장으로

```
미니앱 레포 (빌드 머신 · Node)
  react-native-mf deploy -c production
    ① babel      미니앱 자기 babel config 로 소스 트리를 transpile
    ② esbuild    import 'react'  →  globalThis.__RN_MF_SHARED__['react'] 읽기로 바꿔치기
                 번들 끝에 self-register footer 두 줄
    ③ 후처리     let · const 제거 (Hermes 런타임 컴파일러 대응)
    ④ 올리기     mini-apps/settings/1.2.0/index.bundle.js         불변
                 mini-apps/settings/production/manifest.json      릴리스를 맨 앞에 더한다
                                  │
                                  ▼  HTTP
호스트 앱 (React Native 런타임)
  부팅   registerShared({ react, 'react-native', … })   →  __RN_MF_SHARED__ 를 채운다
         scriptManager.addResolver(createManifestResolver(…))
  화면   useRemote('settings')
    ⑤ resolve    manifest.json 에서 켜져 있고 requires 가 호스트와 맞는 최신 릴리스를 고른다
    ⑥ download   storage 캐시를 먼저 보고, 없으면 fetch 해서 캐시에 쓴다
    ⑦ execute    new Function(source)()  →  footer 가 __RN_MF_REMOTES__['settings'] 에 자기를 넣는다
    ⑧ 회수       getRemote('settings')  →  { default: SettingsApp }  →  렌더
```

미니앱 번들은 React 를 들고 오지 않고(②), 호스트는 미니앱을 `import` 하지 않는다(⑦).
둘은 따로 번들돼서 **모듈 그래프가 다르다.** 만날 수 있는 곳은 런타임 전역 하나뿐이고, 그래서
칸이 둘이다.

### 만나는 곳 — `globalThis` 두 칸

| 전역 키 | 쓰는 쪽 | 읽는 쪽 |
| --- | --- | --- |
| `__RN_MF_SHARED__` | 호스트 — `registerShared()` | 원격 번들 (② 에서 바꿔치기된 코드) |
| `__RN_MF_REMOTES__` | 원격 번들 — footer 가 자기를 넣는다 | 호스트 — `getRemote()` |

**방향이 반대인 일방통행 둘이다.** 호스트가 의존성을 내려주고, 미니앱이 자기를 올려준다.

#### ② 미니앱이 shared 를 읽는다 — 빌드타임 치환

`sharedScopePlugin` 이 `import` 를 **모듈 소스째로 갈아끼운다**. 산출물에 `require("react")` 가
남지 않는 이유다.

```js
// 미니앱 소스
import { useState } from 'react'
```

```js
// 번들 안 — 플러그인이 'react' 모듈을 이 여섯 줄로 바꿔치기한다
var scope = globalThis["__RN_MF_SHARED__"];
var mod = scope && scope["react"];
if (mod === undefined) {
  throw new Error('[react-native-mf] shared 모듈 "react" 이 등록돼 있지 않다. ...');
}
module.exports = mod;
```

조회 키는 **미니앱이 쓴 specifier 그대로**다 — `react/jsx-runtime` 은 `react/jsx-runtime` 으로 찾는다.

#### ② 미니앱이 자기를 꽂는다 — footer

`withSelfRegister` 가 esbuild 를 `iife` + `globalName` 으로 돌리고, 산출물 끝에 두 줄을 붙인다.

```js
// 번들 맨 끝 — 실행되면 이 두 줄이 돈다
globalThis["__RN_MF_REMOTES__"] = globalThis["__RN_MF_REMOTES__"] || {};
globalThis["__RN_MF_REMOTES__"]["settings"] = __RN_MF_REMOTE_ENTRY__;
```

**"꽂는다" 가 일어나는 물리적 지점이 이 두 줄이다.** 호스트는 아무것도 안 한다 — 번들을
실행하기만 하고, 올라오는 건 번들이 스스로 한다.

#### ⑦ 호스트가 실행시킨다

`scriptManager.load` 안의 한 줄이 전부다.

```ts
new Function(`${source}\n//# sourceURL=${locator.url}`)()   // ← footer 두 줄이 여기서 돈다
const remote = getRemote(name)                               // ← 그래서 바로 회수된다
```

`require` 를 주입하지 않는다. 주입하던 시절엔 호스트가 모듈 이름을 손으로 나열한
화이트리스트를 들어야 했는데, ② 의 치환이 그 목록을 없앴다.

#### 부트 순서 — shared 가 먼저

`__RN_MF_REMOTES__` 는 **먼저 만지는 쪽이 만든다**(`globalRecord` 의 지연 생성 · footer 의 `|| {}`).
원격 번들이 호스트보다 먼저 실행돼도, 반대여도 같은 칸을 본다.

`__RN_MF_SHARED__` 는 다르다. 원격 번들은 이 칸을 읽기만 하고, 키가 없으면 실행 시점에 던진다.
그래서 `registerShared` 는 어떤 원격 번들보다 먼저 돈다.

### 이름 하나가 잇는다

미니앱을 "꽂는다" 는 건 **같은 문자열을 여러 곳에 두는 것**이다. 그 밖에 호스트가 미니앱을
아는 방법은 없다 — import 도, 등록 테이블도 없다.

| 위치 | 코드 | 누가 |
| --- | --- | --- |
| 미니앱 config | `defineConfig({ name: 'settings' })` (또는 `build -n settings`) | 미니앱 |
| 저장소 경로 | `mini-apps/settings/production/manifest.json` | `deploy` |
| 번들 footer | `globalThis["__RN_MF_REMOTES__"]["settings"] = …` | 번들이 실행되며 스스로 |
| resolver | `createManifestResolver({ names: ['settings'], … })` | 호스트 부팅 |
| 화면 | `useRemote('settings')` | 호스트 화면 |

어긋나면 이렇게 드러난다.

| 어긋난 곳 | 결과 |
| --- | --- |
| resolver 가 그 이름을 안 맡음 | `"settings" 을 맡는 resolver 가 없다` 로 던진다 |
| 저장소 경로에 매니페스트가 없음(404) · 받은 매니페스트의 `name` 이 다름 | 캐시가 있으면 `onError` 로 알리고 **캐시된 버전을 조용히 연다.** 캐시가 없을 때만 던진다 |
| 실행한 번들이 다른 이름으로 등록됨 | `실행한 번들이 "settings" 으로 등록되지 않았다` 로 던진다 |

⚠️ 가운데 줄은 화면에서 안 보인다. config 의 `name` 을 바꿨는데 호스트는 그대로면, 캐시가 있는
기기는 옛 버전을 계속 연다. `onError` 를 로깅에 꼭 잇는다.

### 버전은 경로에, 고르는 건 매니페스트

`deploy` 는 서버 없이 저장소에 파일 두 종류만 둔다. 번들은 버전마다 경로가 달라서 **한 번 올리면
안 바뀌고**, 어느 버전을 열지는 채널마다 한 장인 매니페스트가 정한다.

```jsonc
// mini-apps/settings/production/manifest.json — 최신이 앞
{
  "name": "settings",
  "releases": [
    { "version": "1.2.0", "requires": ["react", "react-native", "react/jsx-runtime"], "enabled": false, "deployedAt": "…" },
    { "version": "1.1.0", "requires": ["react", "react-native", "react/jsx-runtime"], "enabled": true, "deployedAt": "…" }
  ]
}
```

1.2.0 을 되돌린 상태다. 호스트는 1.1.0 을 연다. 되돌리기는 배포가 아니라 **매니페스트의 `enabled`
한 칸**이고, 번들은 지우지 않는다.

`requires` 는 번들이 실제로 읽는 shared specifier 다. 호스트는 이걸 **다 `registerShared` 했을
때만** 그 릴리스를 연다. 스토어에 아직 옛 바이너리가 깔린 기기는 새 shared 를 요구하는 릴리스를
건너뛰고, 자기가 열 수 있는 가장 새 릴리스로 내려간다.

**버전은 그 미니앱을 처음 `load` 할 때 고른다.** 부팅 때가 아니다. 그래서 아직 그 미니앱을 안 연
세션은 새 버전을 바로 받는다. 이미 실행된 번들은 이번 세션에서 안 바뀐다 — JS 런타임에 올라간
모듈을 내리는 방법이 없다. `s3Storage` 는 매니페스트를 `Cache-Control` 60초로 올리므로, 배포하고
1분이 지나면 그 뒤의 첫 `load` 가 새 버전을 고른다.

## 빠른 시작 — settings 미니앱 하나를 꽂는다

### 1. 호스트 — shared 를 노출하고 목록을 파일로 낸다

목록은 호스트에 한 벌만 둔다.

```ts
// apps/host/src/shared-modules.ts — 사람이 쓰는 유일한 목록
export const SHARED_MODULES = {
  react: require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),
  'react-native': require('react-native'),
}
```

`index.js` 에서, `AppRegistry` 등록보다 먼저 부른다.

```ts
import { registerShared } from '@coldsurfers/react-native-mf'
import { SHARED_MODULES } from './src/shared-modules'

registerShared(SHARED_MODULES)
```

미니앱 빌드는 같은 키를 JSON 배열로 읽는다. 이 파일은 손으로 따로 쓰지 않고 `SHARED_MODULES` 의
키에서 생성한다. billets-app 은 소스에서 키를 뽑아 생성하고, 커밋된 파일이 최신인지 검사한다.

```jsonc
// apps/host/shared-modules.json — 생성물. SHARED_MODULES 의 키 그대로
["react", "react/jsx-runtime", "react-native"]
```

두 벌을 손으로 들면 갈라지고, 갈라진 방향마다 증상이 다르다.

| 갈라진 방향 | 증상 |
| --- | --- |
| JSON 에만 있는 키 | 그 키를 읽는 릴리스를 `createManifestResolver` 가 건너뛴다 |
| `registerShared` 에만 있는 패키지 | 치환되지 않아 미니앱 번들에 사본이 들어간다. 로드는 되고 React 가 둘이 된다 |

### 2. 미니앱 — config 를 두고 배포한다

미니앱은 평범한 RN 컴포넌트를 `export default` 한다. 호스트를 모른다.

```tsx
// settings-mini-app/src/index.tsx
export default function SettingsApp(props: Props) { ... }
```

미니앱 루트에 `babel.config.js` 가 있어야 한다([아래 ⚠️](#미니앱-빌드--build)). 그 옆에 config 를 둔다.

```ts
// settings-mini-app/react-native-mf.config.ts
import { defineConfig, s3Storage } from '@coldsurfers/react-native-mf/deploy'

export default defineConfig({
  name: 'settings',
  prefix: 'mini-apps',
  storage: s3Storage({ bucket: 'my-bucket', region: 'ap-northeast-2' }),
  build: { entry: 'index.tsx', sharedFrom: '../../apps/host/shared-modules.json' },
})
```

```bash
react-native-mf deploy -c staging -i                       # 버전을 고르고 확인한 뒤 올린다
react-native-mf promote --from staging -c production -i    # staging 에서 본 번들을 그대로 올린다
```

### 3. 호스트 — 부팅에 저장소와 resolver 를 단다

`registerShared` 바로 뒤, React 트리 **밖**이다.

```ts
import { createManifestResolver, scriptManager } from '@coldsurfers/react-native-mf'

scriptManager.setStorage(storage) // ScriptStorage — 아래 「스토리지는 소비처가 준다」
scriptManager.addResolver(
  createManifestResolver({
    baseUrl: 'https://cdn.example.com', // {baseUrl}/mini-apps/settings/production/manifest.json 을 읽는다
    prefix: 'mini-apps',
    channel: 'production',
    names: ['settings'],
    storage,
    onError: (error, name) => report(error, { name }), // 캐시로 넘어갈 때 원인을 받는다
  }),
)
```

dev 에서는 소스를 레지스트리에 바로 꽂는다. 이미 등록된 이름이면 `load` 는 받지도 실행하지도 않는다.

```ts
import { registerRemote } from '@coldsurfers/react-native-mf'

if (__DEV__) registerRemote('settings', require('../mini-apps/settings/src')) // 경로는 레포 구조를 따른다
```

⚠️ 그래서 dev 에서는 빌드(①~④)도 로드(⑤~⑦)도 안 돈다. shared 치환이 없으니 `registerShared`
누락이나 번들 안의 사본도 dev 에서는 안 보인다. 원격 경로는 staging 채널로 확인한다.

### 4. 화면 — `useRemote`

```tsx
import { resetRemote, useRemote } from '@coldsurfers/react-native-mf'

function SettingsScreen(props: Props) {
  const { default: MiniApp } = useRemote<{ default: FC<Props> }>('settings')

  return <MiniApp {...props} />
}
```

```tsx
<ErrorBoundary onReset={() => resetRemote('settings')} fallback={<LoadFailed />}>
  <Suspense fallback={<Spinner />}>
    <SettingsScreen />
  </Suspense>
</ErrorBoundary>
```

여기서 미니앱이 처음 실행된다. 각 단계의 세부는 아래 레퍼런스에 있다.

## 진입점

실행 환경이 달라서 진입점을 가른다 — 배럴 하나로 묶으면 RN 앱이 esbuild 를 물게 된다.

| 진입점 | 어디서 도나 | 주로 쓰는 것 |
| --- | --- | --- |
| `@coldsurfers/react-native-mf` | 호스트 (React Native) | `registerShared` · `getRemote` · `registerRemote` · `scriptManager` · `createManifestResolver` · `createDevResolver` · `useRemote` · `resetRemote` |
| `@coldsurfers/react-native-mf/esbuild` | 빌드 머신 (Node) | `sharedScopePlugin` · `withSelfRegister` · `DEFAULT_SHARED_MODULES` |
| `@coldsurfers/react-native-mf/deploy` | 빌드 머신 (Node) | `defineConfig` · `s3Storage` — `react-native-mf.config.ts` 가 import 한다 |
| `@coldsurfers/react-native-mf/cli` | 빌드 머신 (Node) | `run(argv)` — bin 을 코드에서 부를 때 |
| `react-native-mf` (bin) | 빌드 머신 (Node) | `build` · `dev` · `deploy` · `rollback` · `promote` |

## 미니앱 빌드 — `build`

`deploy` 가 안에서 부르는 것과 같다. 올리지 않고 굽기만 할 때 쓴다.

```jsonc
// settings-mini-app/package.json
"scripts": {
  "build:bundle": "react-native-mf build -o build/out/index.bundle.js -n settings --shared-from ../../apps/host/shared-modules.json"
}
```

세 걸음이고 어느 하나도 다른 둘로 대체되지 않는다.

| | 무엇을 | 왜 |
| --- | --- | --- |
| ① babel transpile | 소스 트리 전체를 미니앱 **자기** config 로 | esbuild 는 AST 를 다시 쓰는 babel 플러그인(reanimated worklet 등)을 못 돈다 |
| ② esbuild bundle | shared 치환 + self-register footer | 위 [사용원리](#사용원리) 의 ② 그대로 |
| ③ block-scoping | 산출물의 `let`/`const` 제거 | Hermes **런타임 컴파일러** — 아래 ⚠️ |

| 옵션 | |
| --- | --- |
| `-o, --out-file <path>` | 산출물 경로 (필수) |
| `-n, --name <name>` | 원격 이름 — 호스트가 이 이름으로 회수한다 (필수) |
| `--src <dir>` · `--entry <file>` | 기본 `src` · `index.ts` (entry 는 `--src` 기준) |
| `--shared-from <path>` | 호스트가 내놓은 매니페스트에서 읽는다 — **권장**, 아래 참고 |
| `--shared <names>` | 직접 적는다. 반복하거나 쉼표로 잇는다. 기본은 `react,react-native` |
| `--babel-config <path>` | 생략하면 babel 이 cwd 에서 `babel.config.*` 를 찾는다 |
| `--no-block-scoping` | ③ 을 끈다 |

⚠️ **`--shared` 와 `--shared-from` 은 같이 못 쓴다.** 정본을 하나로 모으려고 연 플래그라
둘을 같이 받으면 목적이 사라진다.

⚠️ **미니앱에 `babel.config.js` 가 있어야 한다.** 이 패키지는 RN 프리셋을 들지 않는다 —
어떤 프리셋·플러그인을 태울지는 미니앱의 사실이고, 여기가 들면 RN 이나 reanimated 가 올라갈
때마다 이 패키지가 발행돼야 한다. shared 목록에서 그은 선과 같은 선이다.

⚠️ **③ 은 Hermes 런타임 컴파일러 때문이다.** 원격 번들만 `new Function` 으로 실행돼서
hermesc 가 아니라 런타임 컴파일러를 탄다. 그쪽은 루프 안 `let` 을 반복마다 새 바인딩으로
만들지 않아 클로저가 마지막 값을 붙든다. esbuild 가 CJS 인터롭용으로 넣는 `__copyProps` 가
정확히 그 모양이라, shared 모듈의 **모든 프로퍼티가 마지막 export 하나로** 읽혔다
(`QueryClient` → `skipToken`, 그래서 `new Symbol()`). 헬퍼를 고치는 대신 산출물에서 통째로
없앤다 — 미니앱 자기 코드가 같은 패턴을 밟는 것도 같이 막힌다. 비용은 한 번 더 도는 ~50ms.

중간 산출물은 `build/.transpiled/<name>/` 에 떨어진다. 위치 조건이 둘이다.

- **프로젝트 안이어야 한다** — esbuild 는 transpile 된 파일의 위치에서 bare import 를 찾는다.
  레포 밖(`os.tmpdir()`)에 두면 미니앱 의존성이 통째로 안 잡힌다
- **`node_modules` 아래면 안 된다** — esbuild 가 그 경로를 서드파티로 보고 최상위
  `"use strict"` 를 안 붙인다. 소스는 ESM(명세상 strict)인데 원격 번들은 `new Function` 으로
  실행되므로, 지시어가 없으면 **sloppy 로 돈다**

실측 (esbuild 0.25.7, 같은 소스·같은 옵션, 디렉터리만 다르게):

| 엔트리 위치 | 산출물 첫 줄 |
| --- | --- |
| `build/.probe/index.js` | `"use strict";` |
| `node_modules/.cache/probe/index.js` | `var __E__ = (() => {` |

## 배포 — `deploy` · `rollback` · `promote`

앱 본체 OTA(hot-updater 등)와 따로 미니앱을 낸다. 서버 없이 저장소에 파일 두 종류만 둔다.

```
{prefix}/{name}/{version}/index.bundle.js   불변 · Cache-Control 1년 immutable
{prefix}/{name}/{channel}/manifest.json     가변 · Cache-Control 60초
```

config 는 미니앱 루트의 `react-native-mf.config.{ts,mjs,js}` 다. `build` 는 `build` 명령의 플래그와
같은 뜻이고 경로는 미니앱 루트 기준이다. 산출물 기본 경로는 `build/out/index.bundle.js`.
하나만 다르다. `sharedFrom` 과 `shared` 를 같이 주면 CLI 처럼 거절하지 않고 `sharedFrom` 을 쓴다.

```ts
// react-native-mf.config.ts — 미니앱 루트
import { defineConfig, s3Storage } from '@coldsurfers/react-native-mf/deploy'

export default defineConfig({
  name: 'settings',
  prefix: 'mini-apps',
  storage: s3Storage({ bucket: 'my-bucket', region: 'ap-northeast-2' }),
  build: { sharedFrom: '../../apps/host/shared-modules.json' },
})
```

```bash
react-native-mf deploy -c staging -i       # 버전 올리기 · 확인을 묻는다
react-native-mf deploy -c production       # package.json 버전 그대로
react-native-mf rollback -c production     # 켜진 최신을 끈다
react-native-mf rollback -c production --to 1.2.0   # 1.2.0 보다 새 것을 끄고 1.2.0 을 켠다
react-native-mf promote --from staging -c production -i   # staging 에 낸 것을 굽지 않고 올린다
react-native-mf promote --from staging -c production --version 1.2.0
```

| 하는 일 | 어떻게 |
| --- | --- |
| 버전 | `package.json` 의 `version`. `-i` 면 고르게 하고 **확인 뒤에** 쓴다. 커밋은 사람이 한다 |
| 매니페스트 | 채널마다 한 장. 릴리스는 최신이 앞이고 `{ version, requires, enabled, deployedAt }` |
| `requires` | 번들이 실제로 읽는 shared specifier. esbuild metafile 에서 뽑는다 — 호스트는 이걸 다 `registerShared` 했을 때만 받는다 |
| 같은 버전 | 같은 채널이면 굽기 전에 거절. 다른 채널이면 번들을 다시 굽고 **내용이 같을 때만** 그대로 쓴다(staging → production) |
| 중간에 죽으면 | 번들 → 매니페스트 순서라 다시 돌리면 끝난다 |
| 되돌리기 | 번들은 지우지 않고 `enabled: false`. 켜진 릴리스가 하나도 안 남는 되돌리기는 거절 |
| 승격 | `promote` 는 굽지 않는다. `--from` 매니페스트의 릴리스(`version` · `requires`)를 그대로 옮긴다 — 그 뒤에 소스 · `package.json` 이 바뀌었어도 된다. `--version` 이 없으면 켜진 최신, 꺼진 릴리스 · 저장소에 없는 번들 · 이미 있는 버전은 거절 |
| 비밀 값 검사 | 굽고 나서 올리기 전에 번들을 훑는다. 걸리면 아무것도 올리지 않고 규칙 · 줄:칸 · 앞 네 글자만 찍는다 |

앱에 실린 번들은 누구나 꺼내 본다. 검사는 형식이 뚜렷한 키만 잡는다 — AWS 액세스 키,
본문이 붙은 PEM 개인 키, GitHub · Slack 토큰, Stripe live 비밀 키, Google API 키, Anthropic · OpenAI
API 키. 앱에 실어도 되는 공개 값(지도 키 등)은 글자 그대로 `scan.allow` 에 적는다.

```ts
export default defineConfig({
  // ...
  scan: { allow: [process.env.MAPS_API_KEY ?? ''] },
})
```

저장소는 `read` · `write` 두 메서드 계약(`DeployStorage`)이다. S3 밖의 저장소도 그 둘만 구현하면
꽂힌다. 조건이 둘이다.

- **`read` 는 없는 키에 `null` 을 돌려준다.** 던지면 배포가 멈춘다
- **`write` 는 `meta.cacheControl` 을 저장소에 그대로 싣는다.** 안 실으면 번들 1년 · 매니페스트 60초가
  CDN 에 안 닿고 CDN 기본 TTL 을 탄다. 그러면 배포와 되돌리기가 언제 호스트에 닿을지 모른다

⚠️ **S3 버킷에 `s3:ListBucket` 이 있어야 한다.** 없으면 없는 키가 `NoSuchKey` 대신
`AccessDenied` 로 와서 첫 배포가 멈춘다.

⚠️ **같은 채널에 두 배포를 동시에 돌리지 않는다.** 매니페스트를 잠그지 않아서 늦게 쓴 쪽이
이긴다. 한 사람이 로컬에서 내는 흐름을 전제로 했다.

⚠️ **config 를 `.ts` 로 두려면 Node 22.18+** 다(type stripping). 미니앱 `package.json` 에
`"type": "module"` 이 없으면 Node 가 재해석 경고를 한 줄 낸다 — 동작은 같다.

## dev 번들 서버 `dev`

`deploy` 와 같은 config 를 읽고, 미니앱을 구워 메모리에서 내준다. 빠른 시작 3 의
`registerRemote` 는 굽기도 로드도 건너뛴다. 빠진 shared 키 · 로드 오류는 이 서버를 거쳐
로컬에서 본다. src 를 감시해서, 저장하면 바뀐 모듈만 기기로 보내 앱을 다시 띄우지 않고 갈아 끼운다.

번들 모양은 `build` 와 다르다. 파일마다 모듈 하나로 굽는다. shared 는 `build` 와 같은 규칙으로 가르고 같은 전역
칸에서 읽지만, `build` 의 치환 코드와 self-register footer 는 거치지 않는다. 배포할 번들 그대로는 staging 채널로 본다.

```jsonc
// settings-mini-app/package.json
"scripts": {
  "dev": "react-native-mf dev"
}
```

```
$ pnpm dev
[react-native-mf] dev settings → http://localhost:8082/settings/index.bundle.js
[react-native-mf] 저장하면 바뀐 모듈만 기기로 보낸다. config · babel config · 의존을 바꾸면 다시 띄운다
[react-native-mf] v1 · 모듈 19개 · 657 ms
[react-native-mf] GET /settings/index.bundle.js 200 · 0.1 s · 55.5 kB · v1
[react-native-mf] v2 · api-client/index.ts · 60 ms
[react-native-mf] hot v2 → localhost · 모듈 1개 · 2.1 kB
[react-native-mf] v3 · 굽지 못했다 · 31 ms
src/index.tsx: Unterminated string constant. (4:22)
```

| 하는 일 | 어떻게 |
| --- | --- |
| 이름 · 빌드 옵션 | config 의 `name` · `build` 를 `deploy` 와 똑같이 편다. 플래그는 `--config <path>` 하나다 |
| 주소 | `http://<hostname>:8082/<name>/index.bundle.js` 하나. 포트와 경로는 패키지 상수라 config 로 열지 않는다 |
| 굽는 때 | 띄울 때 한 번, 그 뒤 src 아래 저장마다. 번들 요청은 **자기가 온 뒤 시작한 굽기만** 받는다. 굽는 중에 온 요청 여럿은 다음 굽기 하나를 나눠 받는다 |
| 갱신 | 바뀐 모듈과 그 위 refresh 경계까지만 기기에서 다시 돈다. 규칙은 [아래](#저장하면-바뀐-모듈만-갈아-끼운다) |
| 실패 | 500 `text/plain` 에 굽기 오류를 싣고, 터미널에는 색 그대로 찍는다. 서버는 살아 있고 옛 번들을 대신 내주지 않는다. 이미 붙은 기기는 오류를 LogBox 에 띄우고 마지막 성공 코드로 돈다 |
| 그 밖의 경로 | `/<name>/hot` 은 기기가 거는 갱신 요청이다. `/<name>/<모듈 경로>` 는 그 모듈의 지금 코드를 `text/javascript` 로 낸다. 기기 스택의 `sourceURL` 이 이 주소다. 나머지는 404 이고, 이 서버가 굽는 이름과 경로를 본문에 적는다 |
| 산출물 | 메모리에서 바로 내준다. `outFile` 도 중간 산출물도 쓰지 않아서 `dev` 가 떠 있는 채로 `deploy` 해도 서로의 파일을 건드리지 않는다 |

⚠️ **config 와 babel config 는 띄울 때 한 번 읽는다.** babel 은 한 프로세스에서 읽은 config 를 다시
읽지 않는다. 실측으로, 같은 프로세스에서 `babel.config.cjs` 의 프리셋을 지워도 옛 프리셋으로 구웠다.
config · babel config · babel 플러그인을 바꾸면 `dev` 를 다시 띄운다. `sharedFrom` 매니페스트는 굽기마다 다시 읽는다.

⚠️ **8082 는 미니앱 하나가 쓴다.** 두 번째 `dev` 는 포트를 이미 쓰고 있다고 알리고 1 로 끝난다.

⚠️ **config 가 import 에서 배포 비밀을 요구하면 `dev` 가 뜨지 않는다.** `s3Storage` 의 `bucket` 은 비어
있어도 된다. 읽거나 쓸 때 던지므로 env 를 그대로 넘긴다.

```ts
storage: s3Storage({ bucket: process.env.MINI_APP_S3_BUCKET, region: process.env.MINI_APP_S3_REGION }),
```

### 호스트는 `createDevResolver` 로 받는다

```ts
import { createDevResolver, scriptManager } from '@coldsurfers/react-native-mf'

// 기기에서 본 개발 머신. iOS 시뮬레이터는 localhost, Android 에뮬레이터는 10.0.2.2
const hostname = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'

// createManifestResolver 보다 먼저 단다. 빠른 시작 3 의 registerRemote 는 이 이름에 걸지 않는다
if (__DEV__) scriptManager.addResolver(createDevResolver({ hostname, names: ['settings'] }))
```

⚠️ **resolver 는 단 순서대로 묻고 처음 맡은 쪽이 이긴다.** manifest resolver 뒤에 달면 dev 서버를 한 번도
부르지 않는다. `__DEV__` 로 막지 않으면 릴리스 빌드도 개발 머신으로 간다. 받기에 실패해도 다음 resolver 로
넘어가지 않는다. `registerRemote` 로 이미 꽂은 이름은 `load` 가 받지 않으므로 둘을 같이 걸지 않는다.

주소는 dev 서버와 같은 함수로 만들어서 호스트에 포트와 경로를 적지 않는다. `names` 에 없는 이름은 다음
resolver 로 넘기고, 맡은 이름은 `cache: false` 라 리로드마다 새로 받는다. 굽기가 실패하면 `load` 가 던지는
에러에 서버가 보낸 굽기 오류가 붙어서 LogBox 와 에러 경계에 그대로 뜬다.

실기기는 `hostname` 에 개발 머신의 LAN 주소를 준다. `dev` 는 모든 인터페이스에서 듣는다.

### 저장하면 바뀐 모듈만 갈아 끼운다

호스트에 더 달 것은 없다. 위 `createDevResolver` 한 줄로 받는 dev 번들에 갱신을 받는 코드가 같이 실려 온다.
기기는 `dev` 에 갱신 요청을 늘 하나 걸어 두고, 저장하면 바뀐 모듈만 받아 다시 돌린다. 앱을 다시 띄우지 않으니
화면 state 와 내비게이션 위치가 남는다. 저장에서 기기 적용까지 12회 중앙값 113 ms, 범위 94–169 ms 였다
(iPhone 17 Pro 시뮬레이터 실측).

어디까지 다시 도는지는 Metro 의 Fast Refresh 와 같은 규칙이다. 컴포넌트만 내보내는 모듈이 refresh 경계다.
바뀐 모듈에서 그 모듈을 import 하는 쪽으로 올라가다 경계를 만나면 멈추고, 바뀐 모듈부터 그 경계까지만 다시 돈다.
경계 위는 돌지 않는다. 위에서 쥔 옛 컴포넌트는 react-refresh 가 새 것으로 잇는다.

| 저장한 것 | 기기 |
| --- | --- |
| 컴포넌트 모듈 | 그 모듈만 다시 돈다. `useState` 가 남는다 |
| 컴포넌트가 아닌 모듈 (`api-client`) | 그 모듈부터 가장 가까운 경계까지 다시 돈다. 그 사이 모듈의 최상단 싱글턴(`new QueryClient`)은 새로 만들어지고, 다른 가지의 싱글턴은 그대로다 |
| 경계를 못 만나고 엔트리에 닿는 수정 | 호스트 앱을 리로드한다(`DevSettings.reload`). 엔트리가 컴포넌트가 아닌 것을 하나라도 내보내면 엔트리는 경계가 아니다 |
| 경계가 내보내는 이름이나 컴포넌트를 바꾼다 | 위에서 쥔 옛 값을 이을 수 없어서, 그 경계를 import 하는 쪽에서 경계를 다시 찾는다 |
| 파일을 더하거나 지우거나 이름을 바꾼다 | 리로드 없이 갈아 끼운다 |

### 실패해도 기기는 마지막 성공 코드로 돈다

| 일어난 것 | 기기 |
| --- | --- |
| 굽기 실패 (문법 오류 · 못 푼 import) | 오류 전부가 LogBox 에 뜬다. 고치면 오류 화면이 걷히고, 그 사이 바뀐 모듈이 한 번에 간다 |
| 갱신 중 모듈이 던진다 | 그 모듈은 마지막 성공 값을 지키고, 그 갱신은 refresh 를 건너뛰어 화면이 그대로다. LogBox 스택 맨 위가 던진 줄이다. 다음 갱신이 그 모듈을 다시 돌리므로 원인을 다른 파일에서 고쳐도 돌아온다 |
| 갱신이 호스트에 없는 shared 모듈을 새로 읽는다 | 빠진 키를 전부 이름 대는 오류를 찍고 아무것도 적용하지 않는다 |
| `dev` 가 꺼졌다 | 경고를 한 번 찍고 250 ms 부터 두 배씩 5 s 까지 물러나며 다시 부른다 |
| `dev` 를 다시 띄웠다 | 모듈 전부를 받아 글자가 바뀐 모듈만 다시 돌린다. 꺼진 동안 고친 것도 이렇게 들어온다. 그 사이 깨진 파일이 있으면 오류가 뜨고 앱은 돈다 |
| 호스트에 `__ReactRefresh` 가 없다 (릴리스 빌드) | 경고를 한 번 찍고 원격은 그린다. 컴포넌트를 등록하지 않고 갱신 요청도 걸지 않는다 |

### 알려진 한계

- **엔트리가 내보낸 값을 호스트가 그리지 않고 직접 쓰면, 갱신 뒤에도 옛 값일 수 있다.** 호스트 화면은 `useRemote` 가
  돌려준 네임스페이스 객체를 쥐고 있고, react-refresh 는 컴포넌트만 family 로 잇는다. 대개는 리로드가 먼저 난다.
  엔트리가 컴포넌트가 아닌 것을 하나라도 내보내면 경계가 아니어서다. 옛 값이 남는 것은 두 경우다. 엔트리 아래
  모듈이 엔트리를 다시 import 하는 순환이 있을 때, 그리고 엔트리가 대문자 이름의 함수를 내보내 컴포넌트로 판정될
  때다(vm 에서 실측). 갱신은 그 화면을 다시 그리지 않으므로(추론), 다른 이유로 다시 그려질 때 `useRemote` 가
  레지스트리에서 새 값을 읽는다
- **데이터 훅을 쓰는 컴포넌트나 그 아래 util 을 고치면 자식 state 를 잃을 수 있다.** react-query 가 다시 불러오며
  로딩 분기로 갔다 돌아와서 그 아래가 새로 마운트된다(기기 실측). Fast Refresh 의 동작으로 본다(추론, Metro 와
  나란히 비교하지는 않았다)
- **개발 메뉴의 「Disable Fast Refresh」 를 따르지 않는다.** 꺼도 원격은 계속 갈아 끼운다. 토글 값은 네이티브
  `RCTDevSettings` 와 RN `HMRClient.js` 의 모듈 안 변수에만 있고, JS 에서 읽는 getter 가 없다(RN 0.87 소스에서
  추론). 갱신을 멈추려면 `dev` 를 끈다
- **LogBox 의 8082 프레임은 심볼화되지 않고, 눌러도 열리지 않는다.** 호스트 Metro 가 8082 주소를 심볼화하지 못한다
  (실측). 프레임 주소를 curl 이나 브라우저로 열면 `dev` 가 기기가 돌린 모듈 코드를 내주고, 줄 번호가 그 코드의 줄이다
- **앱을 다시 띄운 직후의 첫 런타임 throw 는 LogBox 토스트가 안 뜰 수 있다.** 네 번 중 한 번 그랬고, 기기 로그에는
  남았다. 원인은 모른다. 실행 직후의 LogBox 타이밍으로 짐작한다(추정)
- **파일 이름 바꾸기와 import 수정이 서로 다른 굽기에 떨어지면 오류가 한 번 뜨고 다음 굽기에 돌아온다**(추론).
  `dev` 는 저장 뒤 25 ms 조용해질 때까지 모아 한 번 굽는다. e2e 11회와 기기에서는 늘 한 굽기로 접혔다

### 안에서는 어떻게 도나

메인테이너용이다. `src/cli/dev-command.ts` 가 HTTP · 감시 · 터미널을, `src/cli/dev/session.ts` 가 상태와 응답을,
`src/cli/dev/modules.ts` 가 굽기를, `src/cli/dev/runtime.ts` 가 기기 쪽을 맡는다. 둘이 같이 무는 타입은
`src/cli/dev/wire.ts` 다. 어느 것도 `exports` 에 없다.

```
dev (Node)                                         기기 (호스트 앱 · Hermes)
  src 저장 → 25 ms 조용해지면 굽기 한 번
    babel (+ react-refresh) → esbuild 로 파일마다 CJS
    commit(state, 굽기) → DevState
  GET /<name>/index.bundle.js  ──────────────────▶  런타임 + 모듈 전부. new Function 이 돌린다
  GET /<name>/hot?have=E.V&seen=E.V  ◀───────────  늘 하나 걸려 있다
    answer(state, cursor) 가 있으면 200, 20 s 동안 없으면 204
  GET /<name>/<모듈 경로>  ◀─────────────────────  LogBox · 디버거가 sourceURL 로 연다
```

- **런타임은 번들에 실린다.** 모듈을 돌리고 갱신을 받는 코드가 호스트 패키지가 아니라 dev 번들 안에 있다. 번들
  모양과 `/hot` 응답은 같은 CLI 버전이 한 응답에 실어 보내므로 계약이 아니고, 바꿔도 major 가 아니다. 호스트와
  미니앱이 이 패키지를 서로 다른 버전으로 깔아도 어긋날 것이 없고, HMR 이 release 호스트에 더한 바이트는 0 이다.
  런타임을 `.` 에 두는 안과 겨룬 기록은 [#85](https://github.com/coldsurfers/public/issues/85) 에 있다
- **런타임 글자는 esbuild 로 한 번 묶는다**(`buildRuntime`). 서버와 테스트가 같은 걸음을 지나고, 테스트는
  `dist/dev-runtime.js` 를 묶은 글자를 빈 vm realm 에서 돌린다. `runtime.ts` 는 Hermes 런타임 컴파일러가 받는
  문법만 쓴다. async · class · generator 가 없다
- **서버는 기기를 모른다.** `dev` 가 드는 상태는 `DevState` 하나고, `commit` 만 바꾼다. 같은 굽기를 두 번 넣어도
  버전이 그대로다. 기기가 커서 `have`(모듈이 반영한 상태)와 `seen`(마지막으로 들은 상태)을 들고 오면, 답은 순수
  함수 `answer(state, cursor)` 가 정한다. 놓친 버전은 다음 답 하나에 접힌다. 기기는 오류 답에서 `seen` 만 옮기므로,
  고친 뒤의 답이 그 사이 바뀐 모듈을 다 싣는다
- **`/hot` 은 long-poll 이다.** 줄 것이 있으면 200 에 `Reply`(`update` · `snapshot` · `error`)를 싣고, 20 s
  동안 없으면 204, 커서가 틀리면 400 이다. 기기는 응답을 받는 대로 다시 건다. 이 패키지는 런타임 의존이 0 이라
  WebSocket 서버를 들이지 않았다
- **epoch 이 다르면 스냅숏이다.** epoch 은 `dev` 프로세스마다 하나다. 다시 띄운 서버는 모듈 전부를 보내고, 기기는
  모듈마다 쥔 코드 글자와 비교해 바뀐 것만 다시 돌린다
- **같은 이름을 두 번 부팅하는 경우는 정리하지 않는다.** 패키지 API 로는 일어나지 않는다. `load` 는 레지스트리
  칸이 차 있으면 돌아가고, 부팅이 던지면 런타임은 갱신 요청을 걸지 않는다

## shared 목록은 호스트가 정한다

기본값은 **둘뿐**이다 — `react` · `react-native` (`DEFAULT_SHARED_MODULES`).
RN 마이크로프론트엔드라면 무조건인 것만 남겼다.

어떤 라이브러리를 shared 로 볼지는 **호스트 앱의 사실**이지 이 패키지의 사실이 아니다.
목록은 소비처가 들고 `include`(또는 CLI 의 `--shared`)로 넘긴다.

```ts
sharedScopePlugin({
  include: [...DEFAULT_SHARED_MODULES, 'react-native-reanimated', '@gorhom/bottom-sheet'],
})
```

### 그래서 미니앱은 목록을 들지 않는다 — `--shared-from`

호스트의 사실인데 미니앱이 같은 목록을 또 적으면 **정본이 둘**이 된다. 둘은 조용히 갈라진다 —
빠진 이름은 에러가 아니라 **미니앱 번들 안의 사본**으로 나타나서, 로드는 되고 React 만 둘이 된다.

그래서 호스트가 자기 레지스트리 키를 파일 하나로 내놓고 미니앱은 아무 목록도 안 든다.

```jsonc
// 호스트가 내놓는다. registerShared 에 넘기는 키 그대로다
["react", "react/jsx-runtime", "react-native", "@coldsurfers/surf-ui/native/Text", …]
```

```bash
react-native-mf build -o out.js -n settings --shared-from ../../apps/host/shared-modules.json
```

**치환 필터는 CLI 가 파생한다.** 두 곳이 쓰는 모양이 다르기 때문이다.

| | 모양 | 예 |
| --- | --- | --- |
| 호스트 등록·조회 | 정확한 specifier | `@coldsurfers/surf-ui/native/Text` |
| 빌드 치환 필터 | 패키지 이름 (서브패스를 덮는다) | `@coldsurfers/surf-ui` |

후자는 전자의 **순수 함수**다. 실측으로 billets-app 의 키 27개에서 파생한 18개가 손으로 쓰던
목록과 정확히 일치했다 — 그러니 파생을 소비처에 시키지 않는다. 시키면 그 단계가 또 손작업이다.

덮는 쪽으로 파생하는 이유: 정확 일치로만 치환하면 호스트가 등록하지 않은 서브패스
(`react-native/Libraries/...`)가 **조용히 번들에 들어간다.** 패키지 이름으로 덮으면 치환은 되고
조회 키가 없어서 로드 시점에 그 이름을 대며 던진다 — 조용한 사본보다 시끄러운 실패가 낫다.

**규칙은 esbuild 의 `external` 과 같다** — 이름 하나가 그 패키지의 **서브패스까지 덮는다.**
`'react'` 가 `react/jsx-runtime` 을, `'react-native'` 가 `react-native/Libraries/...` 를 함께
잡는다. 형제 패키지는 안 잡는다(`'react'` 는 `react-native` 를 먹지 않는다). 그래서 기존
`external` 목록을 그대로 옮겨오면 된다.

⚠️ **덮는 것과 접는 것은 다르다.** `react/jsx-runtime` 이 치환되면 호스트는 **그 이름으로**
`registerShared` 해야 한다 — 조회 키는 원격 번들이 쓴 specifier 그대로고, 부모 패키지로
접지 않는다. 빠뜨리면 `createManifestResolver` 가 그 릴리스를 건너뛰고, 손으로 쓴 resolver 면
로드 시점에 그 이름을 대며 던진다.

## 회수

**등록되는 값은 모듈 네임스페이스다.** 미니앱이 `export default` 를 쓰면 한 겹 더 들어간다 —
원격 번들이 named export 를 여럿 낼 수 있어서 여기서 `.default` 를 풀지 않는다.

```ts
import { getRemote } from '@coldsurfers/react-native-mf'

const settings = getRemote<{ default: React.FC }>('settings')
const MiniApp = settings?.default
```

아직 실행 전이면 `undefined` 다 — 던지지 않는다. 번들을 실행할지 말지는 로더가 판단하므로,
있는지만 묻고 싶으면 `hasRemote(name)` 을 쓴다.

번들은 실행되면 footer 로 스스로 등록한다([사용원리](#사용원리) ②). 실행 방식이 소스 eval 이든
바이트코드든 회수 지점은 이 한 곳이다.

## 로드 — `scriptManager`

`getRemote` 는 **회수** 지점이고, 거기까지 데려오는 일(받기 · 캐시 · 실행)이 `scriptManager` 다.
React 밖이라 부팅 프리페치 · 탭 진입 전 프리로드가 마운트에 묶이지 않는다.

**배선과 로드는 시점이 다르다.** 배선은 부팅에 한 번, 로드는 화면이 필요할 때다. 한 블록처럼
보이면 resolver 를 컴포넌트 안에서 등록하게 되고, 그러면 마운트마다 resolver 가 쌓인다.

### 1. 부팅에 한 번 — resolver

resolver 는 이름 하나를 받아 번들 위치(`ScriptLocator`)를 돌려준다. 등록 순서대로 묻고
**처음 locator 를 주는 쪽**이 이긴다. 못 맡는 이름이면 `undefined` 를 돌려 다음 resolver 로 넘긴다.

`deploy` 로 낸 미니앱이면 resolver 를 손으로 쓰지 않는다. `createManifestResolver` 가 채널
매니페스트를 읽어 고른다.

```ts
import { createManifestResolver, scriptManager } from '@coldsurfers/react-native-mf'

scriptManager.addResolver(
  createManifestResolver({
    baseUrl: CDN,
    prefix: 'mini-apps',
    channel: 'production',
    names: ['settings'],
    storage,
    onError: (error, name) => report(error, { name }),
  }),
)
```

| 상황 | 고르는 것 |
| --- | --- |
| 매니페스트를 받음 | `enabled` 이고 `requires` 를 호스트가 다 `registerShared` 한 첫 릴리스(최신이 앞). `storage` 에서 이 이름의 다른 버전은 지운다 — 되돌린 버전이 오프라인 부팅에 다시 열리지 않게 |
| 받았는데 맞는 게 없음 | 던진다. 캐시로 넘어가지 않는다 — 되돌린 버전을 다시 열지 않게 |
| 못 받음(오프라인 · `timeoutMs` 기본 5초 · 모양 틀림) | `storage` 에 캐시된 이 이름의 가장 높은 버전. `onError` 로 원인을 알린다. 캐시도 없으면 던진다 |

`deploy` 를 안 쓰면 locator 를 직접 돌려준다. resolver 는 `await` 를 품어도 된다. 부팅에서 등록만
하고 **실제 호출은 첫 `load` 때**라, 배선이 네트워크를 기다리지 않는다.

```ts
scriptManager.addResolver(async (name) => {
  if (name !== 'settings') return undefined

  const version = await fetchLatestVersion(name)
  return { url: `${CDN}/${name}/${version}/index.bundle.js`, version }
})
```

| `ScriptLocator` | |
| --- | --- |
| `url` | 번들을 받을 곳. 실행한 코드의 `sourceURL` 로도 쓴다 |
| `version` | 캐시 키에 들어간다. **없으면 캐시하지 않는다** |
| `cache` | 기본 `true`. 매번 새로 받아야 하면 `false` |

**채널 · 롤백 판단은 resolver 하나에 모인다.** URL 결정이 컴포넌트 계층에 있으면 그 판단이 화면마다
흩어진다.

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
<ErrorBoundary onReset={() => resetRemote('settings')} fallback={<LoadFailed />}>
  <Suspense fallback={<Spinner />}>
    <SettingsScreen />
  </Suspense>
</ErrorBoundary>
```

로딩·에러 상태를 손으로 들 필요가 없다 — 상태 셋(`loading`/`error`/`data`)이 Suspense
경계와 ErrorBoundary 로 옮겨간다.

⚠️ **`onReset` 에서 `resetRemote(name)` 를 부른다.** 실패는 기억되고, 지워줘야 다음 렌더가
다시 받는다. 안 부르면 경계를 리셋해도 같은 에러가 즉시 되돌아온다.

기억하는 이유는 React 쪽 사정이다. React 는 렌더에서 던져진 약속의 **상태를 보지 않아서**,
매 렌더 새 약속을 던지면 실패가 무한 루프가 된다. 에러로 바꿔 던져도 비우면 안 된다 — React 는
에러를 만나면 트리를 **한 번 처음부터 다시 그려보고** 같은 에러가 또 나야 경계로 올리는데,
비워두면 그 렌더가 새 로드를 시작해 루프가 이어진다. 실측(react-test-renderer · React 19):

| 던지는 것 | 렌더 | fetch | 결과 |
| --- | --- | --- | --- |
| 매 렌더 새 약속 | 21+ | 5 | 경계가 못 받는다 |
| 정착 뒤 에러, 던지며 비움 | 21+ | 5 | 마찬가지 |
| **정착 뒤 에러, 남겨둠** | **5** | **1** | ✅ 경계가 받는다 |

react-query 가 에러를 캐시에 두고 `QueryErrorResetBoundary` 로만 지우는 것과 같은 모양이다.

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
  런타임에서 내리는 방법은 없다. `createManifestResolver` 를 쓰면 고른 버전 밖의 캐시를 resolver 가
  지우므로 따로 부를 일이 없다

`load` 자체는 실패를 기억하지 않는다 — 다시 부르면 다시 받는다. 기억하는 건 `useRemote` 쪽이고
`resetRemote` 가 지운다. **이미 실행된 번들의 교체는 어느 쪽 재시도로도 안 된다**(위 `invalidate`).

`scriptManager` 는 호스트에 하나면 된다. 테스트처럼 격리가 필요하면 `createScriptManager()` 로
따로 만든다. `useRemote` 는 기본 `scriptManager` 만 본다.

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

## 직접 esbuild 를 부를 때

CLI 가 안 맞으면 두 조각을 자기 esbuild 옵션에 얹는다. 빌드 머신에서만 도는 레인이다.

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

⚠️ 이 경로엔 `build` 의 ① babel 과 ③ block-scoping 이 없다. babel 플러그인(reanimated worklet 등)이
필요하거나 Hermes 런타임 컴파일러 문제([build](#미니앱-빌드--build) ⚠️)를 피해야 하면 `build` 를 쓴다.
