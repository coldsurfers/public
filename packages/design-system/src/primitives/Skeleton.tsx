import {
  type ComponentPropsWithRef,
  type CSSProperties,
  cloneElement,
  isValidElement,
  type ReactElement,
  type Ref,
} from 'react'
import { cx } from './cx'
import {
  type SkeletonRadius,
  type SkeletonTone,
  skeletonRadius,
  skeletonRoot,
  skeletonTone,
} from './Skeleton.css'

export type { SkeletonRadius, SkeletonTone }

/**
 * 로딩 자리표시자 — 데이터가 오기 전 지면의 실루엣.
 *
 *   <Skeleton width="80%" height="1rem" />                      텍스트 줄
 *   <Skeleton aspectRatio="3 / 4" radius="lg" />                포스터 자리
 *   <Skeleton asChild><div className={s.poster} /></Skeleton>   맥동만 얹기
 *
 * **치수는 단일값 props 로만 받는다.** `@media` 분기가 필요한 자리는 `className` 으로 민다 —
 * 인라인 `style` 은 미디어쿼리를 못 담고, 그걸 담으려면 CSS 변수 배선이나 sprinkles 축 확장이
 * 따라오는데 둘 다 이 컴포넌트 밖의 결정이다 (coldsurfers/public#25 결정 1·2).
 *
 * `aria-hidden` 은 **기본으로 박힌다.** 자리표시자는 스크린리더가 읽을 내용이 아니고,
 * 실측상 소비처가 가장 자주 빠뜨린 것이 이 한 줄이다. 로딩 상태를 알려야 하면 그건
 * 이 컴포넌트가 아니라 `role="status"` 를 가진 바깥 컨테이너의 몫이다.
 *
 * `asChild` 면 자기 엘리먼트 대신 자식에 클래스·치수를 입힌다 — 이미 치수를 가진 스타일과
 * 합성하는 자리(`Button` 과 같은 관례). `ref` 는 따라가지만 나머지 props 는 넘기지 않는다.
 *
 * React 19 에선 `ref` 가 평범한 prop 이라 `forwardRef` 로 감싸지 않는다. 그 `ref` 를 타입에
 * 실어 주는 건 `HTMLAttributes` 가 아니라 `ComponentPropsWithRef` 다 — `PropsWithRef` 는
 * React 19 타입에서 항등 함수라 아무것도 안 붙인다.
 */
export interface SkeletonProps extends ComponentPropsWithRef<'div'> {
  /** CSS `width`. `'80%'` · `'5rem'` · `48` 처럼 단일값만. */
  width?: string | number
  /** CSS `height`. */
  height?: string | number
  /** CSS `aspect-ratio` — 포스터(`'3 / 4'`)·커버(`'4 / 3'`) 자리. */
  aspectRatio?: string
  /** `vars.radius` 키. 기본 `none` — 각진 바가 텍스트 줄의 기본 꼴이다. */
  radius?: SkeletonRadius
  /** 기본 `neutral`. 어두운 커버 위에 얹는 자리만 `onCover`. */
  tone?: SkeletonTone
  /** 자식 엘리먼트에 스타일만 입힌다. */
  asChild?: boolean
}

/** `asChild` 로 받은 자식에서 우리가 실제로 건드리는 props. */
type SkeletonChild = {
  className?: string
  style?: CSSProperties
  'aria-hidden'?: ComponentPropsWithRef<'div'>['aria-hidden']
  ref?: Ref<HTMLDivElement>
}

export function Skeleton({
  width,
  height,
  aspectRatio,
  radius = 'none',
  tone = 'neutral',
  asChild,
  className,
  style,
  children,
  ref,
  ...rest
}: SkeletonProps) {
  const cls = cx(skeletonRoot, skeletonTone[tone], skeletonRadius[radius], className)
  // 소비처가 준 `style` 이 이긴다 — props 는 흔한 축의 지름길이지 잠금이 아니다.
  const box: CSSProperties = { width, height, aspectRatio, ...style }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<SkeletonChild>
    return cloneElement(child, {
      className: cx(cls, child.props.className),
      style: { ...box, ...child.props.style },
      'aria-hidden': child.props['aria-hidden'] ?? true,
      ref: ref ?? child.props.ref,
    })
  }

  return (
    <div ref={ref} aria-hidden className={cls} style={box} {...rest}>
      {children}
    </div>
  )
}
