'use client'

import { type HTMLAttributes, type ReactNode, useMemo, useRef } from 'react'
import { MASONRY_SPEC, placeInColumns } from '../contract'
import { cx } from '../primitives/cx'
import * as s from './Masonry.css'

export interface MasonryProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly T[]
  /** 항목의 고유 키 — 놓인 열을 기억하는 열쇠다. */
  keyOf: (item: T) => string
  /** 열 폭 = 1 기준 높이 추정. 핀 카드면 `pinCardHeight`. */
  heightOf: (item: T) => number
  renderItem: (item: T) => ReactNode
  /** 기본 2. */
  columnCount?: number
}

/**
 * 다단 그리드 — 항목을 가장 낮은 열에 차례로 놓는다. 다음 쪽이 붙어도 놓인 항목은 안 옮긴다.
 * 간격은 `MASONRY_SPEC`. 스크롤 · 다음 쪽 받기는 소비처 몫이다.
 * @example
 * <Masonry items={pins} keyOf={(p) => p.id} heightOf={(p) => pinCardHeight(ratioOf(p), !!p.source)}
 *   renderItem={(p) => <PinCard poster={p.poster}>{p.title}</PinCard>} />
 */
export function Masonry<T>({
  items,
  keyOf,
  heightOf,
  renderItem,
  columnCount = MASONRY_SPEC.columnCount,
  className,
  ...rest
}: MasonryProps<T>) {
  const placed = useRef(new Map<string, number>()).current
  // 콜백은 매 렌더 새로 오므로 의존성에서 뺀다 — 배치는 항목 · 열 수가 바뀔 때만 다시 한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 위 주석
  const columns = useMemo(
    () => placeInColumns(items, columnCount, keyOf, heightOf, placed),
    [items, columnCount, placed],
  )
  return (
    <div className={cx(s.root, className)} {...rest}>
      {columns.map((column, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 열은 자리 번호가 곧 정체다
        <div key={index} className={s.column}>
          {column.map((item) => (
            <div key={keyOf(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
