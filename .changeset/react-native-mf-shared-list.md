---
'@coldsurfers/react-native-mf': minor
---

shared 목록의 소유권을 소비처로 넘긴다.

- `common-dependencies.json` 삭제. 버전·사내 패키지 이름은 **호스트 앱의 사실**이라 밖으로
  나가는 패키지의 기본값에 있을 자리가 아니었다. `getSharedDependencies` ·
  `sharedDependencyNames` · `SharedDependency` 도 함께 제거한다 — `requiredVersion` ·
  `singleton` 은 아무도 읽지 않았다(버전 협상은 범위 밖)
- 기본값은 `DEFAULT_SHARED_MODULES` 셋으로 줄인다 — `react` · `react/jsx-runtime` ·
  `react-native`. 그 밖은 `sharedScopePlugin({ include })` 로 소비처가 넘긴다
- 서브패스 치환을 연다. 서브패스는 그냥 이름이고(`react/jsx-runtime`), 끝의 `/*` 는
  와일드카드다 — `'react-native/*'` 는 `react-native/Libraries/...` 를 잡되 맨 이름은
  잡지 않는다. 조회 키는 소비자가 쓴 specifier 그대로라 호스트도 그 이름으로 등록해야 한다
