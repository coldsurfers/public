import {
  type ButtonHTMLAttributes,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
} from 'react'
import type { ChipSize } from '../contract'
import { chip } from './Chip.css'
import { cx } from './cx'

/**
 * 축 이름을 소비처가 부를 수 있게 낸다 — native 짝이 이미 하던 것(`native/Chip`)이다.
 * 웹은 여태 `'sm' | 'md'` 를 여기서 다시 적고 있었다: `CHIP_SPEC` 이 정본인 축을 두 곳이 들면
 * 한쪽만 늘어도 아무도 안 막는다.
 */
export type { ChipSize }

/**
 * Pill — 시안의 4 맥락을 한 어휘로 덮는다.
 *   size="md"  → rounded-full 필. quick chips(Boris…) · section chips(전체·Reviews) · filter(오늘·이번 주)
 *   size="sm"  → 소형 tag. genre 태그(드론·스토너·슈게이즈)
 *   active     → 선택 상태. accent 필 + 흰 텍스트 (오늘·전체 등)
 * 상호작용이면 기본 `button`, 라벨이면 `as="span"`, 라우팅 링크면 `asChild`.
 *
 * ## `active` 의 시각 언어는 여기가 정본이다
 *
 * 2026-09-28 에 반전(ink 필 + paper 텍스트)에서 **accent 필**로 바꿨다. #39 D-2 는 반전을
 * 정본으로 굳히면서 accent 를 "다중선택에서 화면을 지배한다"는 이유로 기각했는데, 동네 스위처
 * 시안(Figma `3743:1318`)이 accent 로 선택을 말했고 그 결정을 사용자가 정본으로 올렸다.
 *
 * 남은 위험은 그대로다 — 필터 칩이 여러 개 켜지면 파란 필이 화면을 채운다. 다중선택 자리가
 * 그렇게 보이면 칩 수를 줄이거나 다른 컨트롤을 고른다. `Callout tone="accent"`(14% 틴트)와는
 * 바탕 농도가 달라 헷갈리지 않는다.
 */
type ChipBase = {
  active?: boolean
  size?: ChipSize
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
  // `props.active` 를 읽는다 — 위에서 기본값을 먹인 `active` 가 아니다. 토글이 아닌 칩
  // (`active` 를 아예 안 넘기는 자리)까지 `aria-pressed="false"` 를 달면 누르는 상태가
  // 없는 버튼을 토글이라고 말하게 된다. 안 넘겼으면 `undefined` 라 속성이 안 붙는다.
  return <button type={type ?? 'button'} aria-pressed={props.active} className={cls} {...rest} />
}

/**
 * 라벨 슬롯 — 아이콘·dot 을 라벨과 같이 넣을 때 **어디까지가 라벨인지** 표시한다.
 *
 * 웹에서는 표식뿐이다. 크기·굵기·색이 이미 필에서 상속되므로 여기서 더 얹을 게 없다.
 * 그래도 두는 이유는 RN 쪽에 있다 — 거기엔 상속이 없어 이 슬롯이 실제로 서식을 얹는다.
 * **두 레인의 호출부가 같은 문장이 되는 값**이 이 빈 `span` 의 값이다(`contract/chip.ts`).
 */
export function ChipLabel({ children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...rest}>{children}</span>
}

Chip.Label = ChipLabel
