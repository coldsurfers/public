import type { HTMLAttributes } from 'react'
import { cx } from '../primitives'
import { container } from './Container.css'

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /**
   * 렌더할 태그. gutter 는 **정렬축이지 의미가 아니라서** 어떤 태그에도 붙는다 —
   * 한 표면 안에서 같은 세로선에 서는 것들이 `<section>`(본문 한 덩이)·`<div>`(묶음만)·
   * `<main>`(문서 본체)로 갈린다. 기본값을 `<div>` 로 두고 시맨틱이 필요한 쪽만 올린다.
   *
   * 목록을 좁게 연 이유: 넓히는 건 minor 지만 좁히는 건 major 다. `ElementType` 으로 활짝
   * 열면 `<button>` 에 gutter 를 붙이는 것도 타입이 통과한다 — 그건 정렬축이 아니다.
   */
  as?: 'div' | 'section' | 'main' | 'aside' | 'header' | 'footer'
}

/**
 * 표면 gutter 정본 — `margin-inline:auto` · `max-width:1440px` · `padding-inline` 6/16.
 *
 * 이 컴포넌트가 생긴 이유는 재사용이 아니라 **드리프트**다. web-next 는 같은 값을 16곳에서
 * 각자 상수로 다시 선언하고 있었다(주석까지 복붙). 정렬 축은 하나여야 하는데 사본이 16개였다.
 *
 * `Page` 안에서만 쓰는 게 아니다 — 헤더·푸터도 같은 축으로 서야 로고와 콘텐츠가 정렬된다.
 *
 * `Page` 와 합치지 않는 이유: 축이 직교한다. `Page` 는 **세로축**(뷰포트 높이·`data-surface`·
 * 팔레트)이고 `Container` 는 **가로축**(정렬선·최대폭)이다. 합치면 지면 배경까지 1440 에서
 * 잘리고(넓은 화면 양옆에 다른 색 띠), 표면당 하나뿐인 `Page` 로는 페이지 안 여러 덩이를
 * 같은 선에 세울 수 없다.
 */
export function Container({ as: Tag = 'div', className, ...rest }: ContainerProps) {
  return <Tag className={cx(container, className)} {...rest} />
}
