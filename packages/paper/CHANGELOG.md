# @coldsurfers/paper

## 0.2.0

### Minor Changes

- [#126](https://github.com/coldsurfers/public/pull/126) [`818e039`](https://github.com/coldsurfers/public/commit/818e039d72dd7ed8065de67eef0b11d63b5e1cb9) Thanks [@yungblud](https://github.com/yungblud)! - 커맨드 셋이 돈다 — `build` · `watch` · `check`.

  - `paper.config.json` 하나가 소비처의 전부다. 앞선 형태는 값이 세 군데(환경변수 ·
    하드코딩된 파일 목록 · 파일명별 예외 맵)에 흩어져 있어서 무엇이 적용됐는지 읽어서
    알 수 없었다
  - 마크다운은 `marked` 로 굽는다. 문서가 지면 컴포넌트를 마크다운 안의 원시 HTML 로
    쓰는데, marked 는 그걸 기본으로 통과시킨다
  - `check` 는 없는 이미지와 **빈 장**을 본다. 빈 장은 결과 PDF 의 장별 콘텐츠 스트림을
    풀어 글자·이미지 연산자를 세서 찾는다 — 인쇄 페이지네이션은 화면 레이아웃과 다른
    계산이라 DOM 을 재면 강제 개행이 든 문서에서 곧장 어긋난다
  - `watch` 는 파일마다 하나만 돌게 잠근다. 에디터는 저장 한 번에 이벤트를 여러 번 내고
    굽는 데 몇 초가 걸려서, 그대로 받으면 Chromium 이 겹쳐 뜬다

  브라우저는 내려받지 않는다. `chromePath` 가 가리키는 Chromium 을 쓴다.

- [#126](https://github.com/coldsurfers/public/pull/126) [`818e039`](https://github.com/coldsurfers/public/commit/818e039d72dd7ed8065de67eef0b11d63b5e1cb9) Thanks [@yungblud](https://github.com/yungblud)! - 인쇄 시맨틱 계약과 `coldsurf` 테마 파생.

  - `src/tokens/contract.ts` — 테마가 채워야 하는 변수 26개. 접두는 `--print-` 다.
    DS 가 `--paper-*` 를 자기 네임스페이스로 쓰고 있어서, 같은 접두를 쓰면 한 이름이
    두 값을 가리키게 된다
  - `build.mjs` — `@coldsurfers/design-system/tokens` 에서 테마 CSS 한 장을 굽는다.
    계약을 못 채웠거나 계약에 없는 걸 채우면 빌드가 깨진다. `var(--없는이름)` 은 색만
    조용히 비는데, 지면은 사람이 열어보기 전엔 그걸 아무도 모른다
  - `src/css/` — `print`(지면 물리) · `prose`(마크다운 태그) · `components`(지면 조판).
    값은 전부 `var(--print-*)` 이고 하드코딩 hex 는 없다

  DS 에 대응이 없는 값은 지어내지 않고 파생했다 — 인용면은 accent 를 지면에 섞고,
  표지 색면은 cover scale 에서 하나를 고르는 대신 잉크를 쓴다. 링크만 예외로 `linkHover`
  값을 정지 상태로 쓴다. 종이엔 hover 가 없어서 본문과 같은 색인 링크는 링크로 안 읽힌다.

- [#125](https://github.com/coldsurfers/public/pull/125) [`6b14375`](https://github.com/coldsurfers/public/commit/6b1437503fe0023b456660e6b73c80f67e9822cc) Thanks [@yungblud](https://github.com/yungblud)! - 새 패키지. 마크다운을 지면으로 굽는 CLI 다 — 산출물은 PDF 하나다.

  스캐폴딩 범위 — **아직 도는 커맨드가 없다.** 선 자리만 잡혀 있다:

  - `bin` 진입점 `paper` — 커맨드 레지스트리와 디스패처. usage 를 레지스트리에서 만들어서,
    구현되지 않은 커맨드가 도움말에 실릴 수 없다
  - `exports` 맵은 내지 않는다. 이 패키지의 API 는 모듈이 아니라 실행 파일이라
    소비처가 import 할 게 없고, 열지 않은 만큼 지킬 계약도 없다

  토큰 파생 · 인쇄 CSS · `build` · `watch` · `check` 는 다음이다 — coldsurfers/public#124.

- [#126](https://github.com/coldsurfers/public/pull/126) [`818e039`](https://github.com/coldsurfers/public/commit/818e039d72dd7ed8065de67eef0b11d63b5e1cb9) Thanks [@yungblud](https://github.com/yungblud)! - 설정 파일 없이 `paper build a.md` 가 돈다.

  - **Chromium 을 찾는다.** macOS · Windows · Linux 의 표준 설치 경로를 훑고, Chrome 이
    없으면 Chromium 이나 Edge 도 받는다. 경로를 직접 줄 땐 `PAPER_CHROME_PATH` 가 설정보다
    앞선다 — 실행 경로는 기계마다 다른데 설정 파일은 커밋되므로, 팀이 공유하는 값을 개인
    기계가 덮을 수 있어야 한다
  - **설정의 모든 필드가 선택이다.** 설정 파일 자체도 없어도 된다. 다만 `--config` 로
    명시한 경로가 없으면 그건 실패다 — 사람이 가리킨 파일이 없는 것과 아예 안 쓰는 것은 다르다
  - **인자로 준 경로는 실행 위치 기준**, 설정의 `files` 는 `docsDir` 기준이다. 셸에서 탭
    완성으로 얻는 경로와 설정에 적는 목록은 각자 당연한 기준이 다르다
  - 없는 문서는 굽기 전에 잡는다. 다섯 중 셋째가 없으면 앞의 둘을 굽고 터지는 대신
    시작하기 전에 알려준다

  PDF 는 `outDir` 이 없으면 문서 옆 `pdf/` 에 떨어진다.
