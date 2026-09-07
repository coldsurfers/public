# @coldsurfers/react-native-mf

React Native 앱이 **원격 번들을 호스트와 같은 JS 런타임에 끼워넣는** 레이어.

미니앱이 새 의존성을 쓸 때마다 호스트를 고쳐 스토어에 다시 올려야 하는 구조를 끊는 것이 목표다.

> 🚧 **Phase 1 — 빌드 파이프라인.** 런타임과 번들러 플러그인이 동작한다. CLI 는 아직 계약만
> 세워져 있다. 로드맵: [coldsurfers/public#85](https://github.com/coldsurfers/public/issues/85)

## 레인

실행 환경이 달라서 진입점을 가른다 — 배럴 하나로 묶으면 RN 앱이 esbuild 를 물게 된다.

| 진입점 | 어디서 도나 | 상태 |
| --- | --- | --- |
| `@coldsurfers/react-native-mf` | 호스트 (React Native) | ✅ shared scope · 원격 레지스트리 |
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

```ts
import { getRemote } from '@coldsurfers/react-native-mf'

const MiniApp = getRemote<React.FC>('settings')
```

번들이 실행되면 스스로 등록한다([3] self-register). 실행 방식이 소스 eval 이든 바이트코드든
회수 지점은 이 한 곳이다.
