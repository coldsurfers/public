import { cloneElement, type HTMLAttributes, isValidElement, type ReactElement } from 'react'
import { cx } from './cx'
import { emptyState } from './EmptyState.css'

/**
 * 「아직 아무것도 없습니다」 자리의 세로 스택 — 제목·본문·(액션)을 가운데로 세운다.
 * 근거·결정 로그: coldsurfers/public#42
 *
 * ```tsx
 * <EmptyState className={sprinkles({ paddingY: '20' })}>
 *   <p className={sprinkles({ fontSize: 'xl', color: 'strong' })}>오늘 밤은 조용하네요.</p>
 *   <p className={sprinkles({ fontSize: 'base', color: 'muted' })}>오늘 저녁 공연이 아직 없어요.</p>
 *   <Button variant="accent" size="cta" asChild>
 *     <Link to="/this-weekend">이번 주말 보기</Link>
 *   </Button>
 * </EmptyState>
 * ```
 *
 * ## 조판을 props 로 받지 않는다
 *
 * `title`/`description`/`action` 이 없는 건 축약이 아니라 실측 결과다 — 5벌의 제목 조판이
 * 이미 셋으로 갈려 있어, props 로 접으면 정본 하나를 골라야 하고 다섯 중 넷이 시각적으로
 * 바뀐다(#42 D-7). 조판은 지면이 알고, 이 컴포넌트는 **세우는 방식**만 안다.
 *
 * ## `ContentPlaceholder` 가 아니다
 *
 * seed 의 같은 이름은 *이미지가 안 뜬 자리*의 아이콘 박스(`type`·`style`·`children`)고,
 * 그 축은 우리 `CoverBlock` 이 이미 든다. 이름이 겹치면 자리가 겹친다(#42 D-2).
 *
 * ## 셸을 소유하지 않는다
 *
 * 바깥 여백·gutter·maxWidth 는 지면 몫이다. 지면이 이미 `Container` 로 그 셸을 세우고 있으면
 * `asChild` 로 합친다 — 래퍼를 한 겹 더 만들지 않는다.
 *
 * ```tsx
 * <EmptyState asChild>
 *   <Container as="section" className={sprinkles({ paddingY: '20' })}>…</Container>
 * </EmptyState>
 * ```
 */
export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 자기 엘리먼트 대신 자식에 스타일을 입힌다 — `Button`·`Chip`·`UnderlineTab` 과 같은 규율.
   * 지면이 이미 셸(`Container`)을 세운 자리에서 래퍼가 겹치지 않게 한다.
   */
  asChild?: boolean
}

/** `asChild` 로 받은 자식에서 우리가 실제로 건드리는 props. */
type EmptyStateChild = { className?: string }

export function EmptyState({ asChild, className, children, ...rest }: EmptyStateProps) {
  const cls = cx(emptyState, className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<EmptyStateChild>
    return cloneElement(child, { className: cx(cls, child.props.className) })
  }

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}
