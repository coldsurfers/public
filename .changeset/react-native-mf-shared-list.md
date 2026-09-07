---
'@coldsurfers/react-native-mf': minor
---

shared 목록의 소유권을 소비처로 넘긴다.

- `common-dependencies.json` 삭제. 버전·사내 패키지 이름은 **호스트 앱의 사실**이라 밖으로
  나가는 패키지의 기본값에 있을 자리가 아니었다. `getSharedDependencies` ·
  `sharedDependencyNames` · `SharedDependency` 도 함께 제거한다 — `requiredVersion` ·
  `singleton` 은 아무도 읽지 않았다(버전 협상은 범위 밖)
- 기본값은 `DEFAULT_SHARED_MODULES` 둘로 줄인다 — `react` · `react-native`.
  그 밖은 `sharedScopePlugin({ include })` 로 소비처가 넘긴다
- 서브패스 치환을 연다. 규칙은 **esbuild 의 `external` 과 같다** — 이름 하나가 그 패키지의
  서브패스까지 덮는다(`'react'` → `react/jsx-runtime`). 형제 패키지는 안 잡는다.
  기존 `external` 목록을 그대로 옮겨올 수 있다
- 다만 조회 키는 원격 번들이 쓴 specifier 그대로다 — 덮는다고 접히지 않는다. 호스트는
  `react/jsx-runtime` 을 **그 이름으로** `registerShared` 해야 하고, 빠뜨리면 로드 시점에
  그 이름을 대며 던진다
