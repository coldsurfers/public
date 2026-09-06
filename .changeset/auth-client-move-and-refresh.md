---
'@coldsurfers/auth-client': minor
---

`session.refresh()` 추가 — 재발급만 따로 트리거한다.

auth 가 아닌 *다른 서버*(billets API) 의 401 을 받은 호출자를 위한 자리다. 지금까지 재발급 절차는
`HttpClient` 안에 private 으로 갇혀 있어서, 그런 호출자는 경로·저장·실패 시 정리를 각자 다시 짜야 했다.
`HttpClient.refreshInFlight` 를 공유하므로 동시에 몇 번을 불러도 요청은 한 번이고, 성공 시 새 토큰이
storage 에 이미 저장돼 있다.

곁들여 이 패키지가 `coldsurfers/public` 으로 옮겨왔고 **발행 형태가 raw `src` → 빌드본 `dist`** 로 바뀐다.
소비처가 `transpilePackages` 같은 설정을 지지 않아도 된다.
