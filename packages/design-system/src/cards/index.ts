/**
 * 카드 — 커버 + 텍스트 블록으로 짜인 조립 컴포넌트.
 *
 * primitives 와 가르는 선은 **합성 깊이**다. `Button` 은 자기 하나로 끝나지만 카드는
 * `CoverBlock`·`Eyebrow` 를 안에서 조립한다. 그래서 API 도 값이 아니라 슬롯(`footer`·
 * `coverAction`)을 받는다 — 무엇을 넣을지는 소비처가 정한다.
 *
 * 도메인은 이름에만 남기고 타입에는 안 남겼다: `ConcertCard` 의 props 는 `title`·`meta`·
 * `tone` 이라 공연 스키마를 모른다. 라우터도 안 문다 — 클릭은 소비처가 `Link` 로 감싼다.
 *
 * 진입점이 갈린 이유는 JS 뿐이다. CSS 는 `cssCodeSplit: false` 라 어차피 `styles.css`
 * 한 장에 함께 실린다.
 */
export { ArticleCard, type ArticleCardProps } from './ArticleCard'
export { ConcertCard, type ConcertCardProps } from './ConcertCard'
export { ConcertCardSkeleton, type ConcertCardSkeletonProps } from './ConcertCardSkeleton'
export { LeadFeature, type LeadFeatureProps } from './LeadFeature'
