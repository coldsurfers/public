# @coldsurfers/screens

React Native 화면의 **조립층**. `@coldsurfers/design-system` 위에 얹는다.

```
design-system   무엇처럼 보이는가   토큰 · 프리미티브 · 단품
screens         어떻게 조립되는가   safe area · 탭바 여백 · 로딩 경계
```

판별: **화면 전체의 배치를 정하면 여기, 그 안의 한 칸이면 DS.**
그래서 `TabBar`(단품)는 DS 에 남고, 그 탭바만큼 아래를 비우는 `AppScreen` 은 여기다.

## 설치

peer 로 DS · React · RN · safe-area-context 를 받는다. **DS 를 `dependencies` 로 넣지 말 것** —
사본이 둘이 되면 `useScheme()` 이 다른 컨텍스트를 읽는다.

## 쓰기

```tsx
import { AppScreen } from '@coldsurfers/screens/AppScreen'

<AppScreen offsetTop="safeArea" offsetBottom="tabBar">
  <MyList />
</AppScreen>
```

**서브패스로 연다.** Metro 는 tree-shaking 을 하지 않아 배럴(`@coldsurfers/screens`)을 열면
전부 딸려온다 — 근거는 `docs/native-lane-porting.md` 의 「소비 — 배럴이냐 서브패스냐」.

| prop | 값 | 기본 |
| --- | --- | --- |
| `offsetTop` | `'none'` · `'safeArea'` | `'none'` |
| `offsetBottom` | `'none'` · `'safeArea'` · `'tabBar'` | `'tabBar'` |
| `fallback` | Suspense 폴백 | 정중앙 DS `Spinner` |
| `style` | | |

## 안 드는 것

- **에러 경계** — react-query 의존이라 여기서 못 든다. 소비처가 바깥에서 감싼다
- **헤더** — react-navigation `options.header` 가 그린다. 화면 안에 슬롯을 파면 경로가 둘이 된다
- **`left`·`right` 여백** — 소비처 22곳에서 한 번도 안 썼다. 필요해지면 그때 연다
