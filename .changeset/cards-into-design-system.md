---
'@coldsurfers/design-system': minor
---

카드 4종을 흡수한다 — `ConcertCard` · `ConcertCardSkeleton` · `ArticleCard` · `LeadFeature`.
새 서브패스 `./cards` 로 연다.

primitives 와 가르는 선은 **합성 깊이**다. `Button` 은 자기 하나로 끝나지만 카드는
`CoverBlock` · `Eyebrow` 를 안에서 조립하고, 그래서 API 도 값이 아니라 슬롯(`footer` ·
`coverAction`)을 받는다. 도메인은 이름에만 남았다 — `ConcertCard` 의 props 는
`title` · `meta` · `tone` 이라 공연 스키마를 모르고, 라우터도 안 문다.

진입점이 갈린 이유는 JS 뿐이다. `cssCodeSplit: false` 라 CSS 는 `styles.css` 한 장에
함께 실린다 — **44.8 kB → 51.3 kB**(gzip 8.18 kB).
