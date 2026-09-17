---
'@coldsurfers/react-native-mf': minor
---

로더 표면 `scriptManager` 를 런타임 레인에 추가한다 (Phase 1.5)

원격 번들을 받아 실행하는 일을 React 수명주기 밖으로 뺀다. resolver 한 자리에서 dev/prod ·
채널 · 롤백이 갈리고, `load` 는 in-flight 를 접으며 **이미 레지스트리에 있으면 재실행하지
않는다** — 두 번째 실행이 미니앱 top-level 의 `new QueryClient` 를 다시 만들던 자리다.

캐시는 `ScriptStorage` 인터페이스 뒤에 둔다. `fetch` 는 이 패키지가 들고 저장만 주입받아서,
공개 패키지가 `react-native-fs` 같은 네이티브 모듈을 물지 않는다. `invalidate({ keep })` 가
옛 버전 파일을 정리한다.

Suspense 어댑터 `useRemote` 도 같이 낸다. React 를 import 하지 않아 peer 는 늘지 않는다 —
훅 API 를 부르지 않고 "있으면 값, 없으면 약속을 던진다" 만 한다.

배럴(`.`)에 재수출한다 — 새 진입점을 열지 않는다. 순수 추가다.
