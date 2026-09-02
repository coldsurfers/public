import {
  type ButtonHTMLAttributes,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
} from 'react'
import { cx } from './cx'
import { underlineTab, underlineTabs } from './UnderlineTabs.css'

/**
 * 밑줄 탭 줄. 근거·결정 로그: coldsurfers/public#39
 *
 * 아래 괘선만 긋는다 — `gap`·정렬·바깥 여백은 소비처가 준다(실측 4벌이 전부 다른 값이었다).
 *
 * ```tsx
 * <UnderlineTabs className={cx(sprinkles({ gap: '7' }), styles.tabGap)}>
 *   {items.map((it) => (
 *     <UnderlineTab key={it.key} active={tab === it.key} asChild>
 *       <Link to={it.to}>{it.label}</Link>
 *     </UnderlineTab>
 *   ))}
 * </UnderlineTabs>
 * ```
 */
export function UnderlineTabs({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(underlineTabs, className)} {...rest} />
}

/** `asChild` 로 받은 자식에서 우리가 실제로 건드리는 props. */
type UnderlineTabChild = {
  className?: string
  'aria-current'?: HTMLAttributes<HTMLElement>['aria-current']
}

export interface UnderlineTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 선택 상태. 밑줄·글자색·굵기가 함께 갈린다. */
  active?: boolean
  /**
   * `<button>` 대신 자식 엘리먼트(라우터 `Link`)에 스타일을 입힌다 — `Button`·`Skeleton` 과
   * 같은 규율(#39 D-6). 실측 4벌 중 **3벌이 라우팅 링크**라 이쪽이 기본 사용법에 가깝다.
   */
  asChild?: boolean
}

/**
 * 밑줄 탭 한 칸.
 *
 * ## 선택 신호를 엘리먼트가 정한다 (#39 D-4)
 *
 * **링크면 `aria-current="page"`, 버튼이면 `aria-pressed`.** 라우팅 링크에 `role="tab"` 을
 * 붙이는 건 오히려 틀렸다 — WAI-ARIA 탭 패턴은 화살표 키 이동을 요구하는데 링크 네비엔 그게
 * 없다. 역할만 있고 동작이 없는 쪽이 무표시보다 나쁘다(`VenueDetail` 의 `<Link role="tab">`
 * 이 그 상태였다).
 *
 * `asChild` 일 때 `aria-current` 를 **기본으로 넣어준다** — 소비처가 명시하면 그게 이긴다.
 * 이 기본값이 이 컴포넌트가 고치는 실제 결함이다: `SettingsTop` 의 탭·레일은 선택 상태가
 * 스크린리더에 **전혀 안 읽혔다**(색만 갈렸다).
 *
 * 화살표 키 이동(roving tabindex)은 범위 밖이다(#39 D-5) — `role="tab"` 을 쓰는 자리가
 * 실측 1벌로 줄어 요구가 거의 사라졌고, 넣으면 축이 스타일 밖으로 나간다.
 */
export function UnderlineTab({
  active = false,
  asChild,
  className,
  children,
  type,
  ...rest
}: UnderlineTabProps) {
  const cls = cx(underlineTab({ active }), className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<UnderlineTabChild>
    return cloneElement(child, {
      className: cx(cls, child.props.className),
      'aria-current': child.props['aria-current'] ?? (active ? 'page' : undefined),
    })
  }

  return (
    <button type={type ?? 'button'} aria-pressed={active} className={cls} {...rest}>
      {children}
    </button>
  )
}
