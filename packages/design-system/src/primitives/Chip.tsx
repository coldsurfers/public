import {
  type ButtonHTMLAttributes,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
} from 'react'
import { chip } from './Chip.css'
import { cx } from './cx'

/**
 * Pill — 시안의 4 맥락을 한 어휘로 덮는다.
 *   size="md"  → rounded-full 필. quick chips(Boris…) · section chips(전체·Reviews) · filter(오늘·이번 주)
 *   size="sm"  → 소형 tag. genre 태그(드론·스토너·슈게이즈)
 *   active     → 선택 상태. ink 필 + paper 텍스트 (오늘·전체 등)
 * 상호작용이면 기본 `button`, 라벨이면 `as="span"`, 라우팅 링크면 `asChild`.
 *
 * ## `active` 의 시각 언어는 여기가 정본이다 (coldsurfers/public#39 D-2)
 *
 * web-next 에 같은 "선택된 칩" 이 **네 가지 언어**로 흩어져 있었다(`accent` 바탕 / `accent`
 * 10% 틴트 / 테두리만 진해짐 / 반전). 반전을 정본으로 굳힌 이유 셋 —
 *
 * 1. 이미 여기 있고 소비처가 산다(`TasteWizard`). 바꾸면 멀쩡한 소비처가 시각적으로 깨진다
 * 2. `new-feed` 로컬 칩이 사실상 같은 언어였다 — 5벌 중 2벌이 이미 여기
 * 3. `accent` 계열 둘은 **다중선택에서 진다.** 필터 칩이 여러 개 켜지면 `accent` 바탕이 화면을
 *    지배하고, 10% 틴트는 `Callout tone="accent"`(14% 틴트)와 헷갈린다
 *
 * 그래서 #39 에서 이 파일의 스타일은 **한 줄도 안 바뀐다.** 그 축의 일은 새 언어를 정하는 게
 * 아니라 로컬 4벌을 이미 있는 것으로 걷어오는 것이다.
 */
type ChipBase = {
  active?: boolean
  size?: 'sm' | 'md'
  /**
   * 자기 엘리먼트 대신 자식(라우터 `Link`)에 스타일을 입힌다 — `Button`·`Skeleton` 과 같은
   * 규율(#39 D-6). 필터 칩은 **크롤 가능한 `<a href>` 여야** 필터된 면이 색인되므로
   * (`GigChip`·`new-feed` 가 그 이유를 주석에 남겼다) 이쪽이 필터 맥락의 기본 사용법이다.
   */
  asChild?: boolean
}

export type ChipProps =
  | (ChipBase & { as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
  | (ChipBase & { as: 'span' } & HTMLAttributes<HTMLSpanElement>)

/** `asChild` 로 받은 자식에서 우리가 실제로 건드리는 props. */
type ChipChild = { className?: string }

export function Chip(props: ChipProps) {
  const { active = false, size = 'md' } = props
  const cls = cx(chip({ size, active }), props.className)

  if (props.asChild && isValidElement(props.children)) {
    const child = props.children as ReactElement<ChipChild>
    return cloneElement(child, { className: cx(cls, child.props.className) })
  }

  if (props.as === 'span') {
    const {
      active: _active,
      size: _size,
      asChild: _asChild,
      as: _as,
      className: _cls,
      ...rest
    } = props
    return <span className={cls} {...rest} />
  }

  const {
    active: _active,
    size: _size,
    asChild: _asChild,
    as: _as,
    className: _cls,
    type,
    ...rest
  } = props
  return <button type={type ?? 'button'} className={cls} {...rest} />
}
