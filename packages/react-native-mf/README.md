# @coldsurfers/react-native-mf

React Native 앱이 **원격 번들을 호스트와 같은 JS 런타임에 끼워넣는** 레이어.

미니앱이 새 의존성을 쓸 때마다 호스트를 고쳐 스토어에 다시 올려야 하는 구조를 끊는 것이 목표다.

> 🚧 **Phase A — 스캐폴딩.** 런타임 primitives 만 동작한다. 번들러 플러그인·CLI 는 계약만
> 세워져 있고 본체는 Phase 1 이다. 로드맵: [coldsurfers/public#85](https://github.com/coldsurfers/public/issues/85)

## 레인

실행 환경이 달라서 진입점을 가른다 — 배럴 하나로 묶으면 RN 앱이 esbuild 를 물게 된다.

| 진입점 | 어디서 도나 | 상태 |
| --- | --- | --- |
| `@coldsurfers/react-native-mf` | 호스트 (React Native) | ✅ shared scope · 원격 레지스트리 |
| `@coldsurfers/react-native-mf/esbuild` | 빌드 머신 (Node) | ⏸ Phase 1 |
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
  'react-native': require('react-native'),
})
```

원격 번들은 `import` 대신 이 전역을 읽는다. 치환은 빌드타임에 `./esbuild` 플러그인이 한다
(Phase 1). 그래서 호스트 쪽에 모듈 이름을 손으로 나열하는 화이트리스트가 남지 않는다.

## 회수

```ts
import { getRemote } from '@coldsurfers/react-native-mf'

const MiniApp = getRemote<React.FC>('settings')
```

번들이 실행되면 스스로 등록한다(③ self-register). 실행 방식이 소스 eval 이든 바이트코드든
회수 지점은 이 한 곳이다.

## shared 카탈로그

`src/shared/common-dependencies.json` 이 정본이다. 값은 **호스트 앱이 실제로 무는 버전**이고,
호스트가 올라가면 여기도 올라가야 한다 — 어긋나면 원격 번들이 없는 API 를 부른다.
자동 동기화는 Phase 1 의 몫이다.

```ts
import { getSharedDependencies } from '@coldsurfers/react-native-mf'
```
