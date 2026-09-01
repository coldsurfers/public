/**
 * 표면 레이아웃 — `Page` · `Container`.
 *
 * seed-design 의 `AppScreen`(stackflow) 이 모바일 스택 화면에 하는 일을 웹 문서 표면에 옮긴 것.
 * 근거·결정 로그: coldsurfers/public#19
 *
 * **여기 없는 것과 그 이유:**
 * - `Page.Header` · `Page.Footer` — 범위 A 에선 `<div>` 한 겹이라 두지 않는다. chrome 은
 *   `Page` 의 자식으로 그냥 놓는다(#19 D-2)
 * - `Section` — 실측에서 떨어졌다. `Container` 위에 `flex-column` + `gap:space-4` 를 얹는
 *   모양이었는데, web-next 34곳 중 그대로 맞는 건 **3곳**이었다(다른 gap 13 · gap 을 자기
 *   `.css.ts` 가 주는 곳 6 · 애초에 flex-column 이 아닌 곳 12). 나머지 31곳은 DS 가 준 걸
 *   도로 지우는 className 을 달게 된다 — 추상화가 아니라 부채다. 세로 리듬은 호출자가
 *   유틸로 준다(#19 D-9)
 * - 헤더·푸터 **내용물** — 라우터·세션·i18n·계측을 문다. 앱의 것이다
 * - `Bar.Left/Main/Right` · 푸터 컬럼 그리드 — 소비처가 아직 하나뿐이라 보류. 두 번째가 생기면 연다
 * - 표면 팔레트(warm-paper 라이트 고정) — 표면 정책은 값이 아니다(`docs/p1-boundary.md` 결정 3).
 *   `Page` 의 `style` 로 앱이 주입한다
 */
export { Container, type ContainerProps } from './Container'
export { Page, type PageProps } from './Page'
