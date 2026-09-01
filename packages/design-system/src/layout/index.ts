/**
 * 표면 레이아웃 — `Page` · `Container` · `Section`.
 *
 * seed-design 의 `AppScreen`(stackflow) 이 모바일 스택 화면에 하는 일을 웹 문서 표면에 옮긴 것.
 * 근거·결정 로그: coldsurfers/public#19
 *
 * **여기 없는 것과 그 이유:**
 * - `Page.Header` · `Page.Footer` — 범위 A 에선 `<div>` 한 겹이라 두지 않는다. chrome 은
 *   `Page` 의 자식으로 그냥 놓는다(#19 D-2)
 * - 헤더·푸터 **내용물** — 라우터·세션·i18n·계측을 문다. 앱의 것이다
 * - `Bar.Left/Main/Right` · 푸터 컬럼 그리드 — 소비처가 아직 하나뿐이라 보류. 두 번째가 생기면 연다
 * - 표면 팔레트(warm-paper 라이트 고정) — 표면 정책은 값이 아니다(`docs/p1-boundary.md` 결정 3).
 *   `Page` 의 `style` 로 앱이 주입한다
 */
export { Container, type ContainerProps } from './Container'
export { Page, type PageProps } from './Page'
export { Section, type SectionHeaderProps, type SectionProps } from './Section'
