---
'@coldsurfers/paper': minor
---

새 패키지. 마크다운을 지면으로 굽는 CLI 다 — 산출물은 PDF 하나다.

스캐폴딩 범위 — **아직 도는 커맨드가 없다.** 선 자리만 잡혀 있다:

- `bin` 진입점 `paper` — 커맨드 레지스트리와 디스패처. usage 를 레지스트리에서 만들어서,
  구현되지 않은 커맨드가 도움말에 실릴 수 없다
- `exports` 맵은 내지 않는다. 이 패키지의 API 는 모듈이 아니라 실행 파일이라
  소비처가 import 할 게 없고, 열지 않은 만큼 지킬 계약도 없다

토큰 파생 · 인쇄 CSS · `build` · `watch` · `check` 는 다음이다 — coldsurfers/public#124.
