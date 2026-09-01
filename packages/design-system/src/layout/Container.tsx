import type { HTMLAttributes } from 'react'
import { cx } from '../primitives'
import { container } from './Container.css'

export type ContainerProps = HTMLAttributes<HTMLDivElement>

/**
 * 표면 gutter 정본 — `margin-inline:auto` · `max-width:1440px` · `padding-inline` 6/16.
 *
 * 이 컴포넌트가 생긴 이유는 재사용이 아니라 **드리프트**다. web-next 는 같은 값을 16곳에서
 * 각자 상수로 다시 선언하고 있었다(주석까지 복붙). 정렬 축은 하나여야 하는데 사본이 16개였다.
 *
 * `Page` 안에서만 쓰는 게 아니다 — 헤더·푸터도 같은 축으로 서야 로고와 콘텐츠가 정렬된다.
 */
export function Container({ className, ...rest }: ContainerProps) {
  return <div className={cx(container, className)} {...rest} />
}
