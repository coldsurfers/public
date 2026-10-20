'use client'

import { type HTMLAttributes, type ReactNode, useLayoutEffect, useMemo, useRef } from 'react'
import { MASONRY_SPEC, placeInColumns } from '../contract'
import { cx } from '../primitives/cx'
import * as s from './Masonry.css'

export interface MasonryProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 쪽을 이어 붙인 전체 — 다음 쪽이 오면 뒤에 붙여 넘긴다. */
  items: readonly T[]
  /** 항목의 고유 키 — 놓인 열 · 잰 높이를 기억하는 열쇠다. */
  keyOf: (item: T) => string
  /** 열 폭 = 1 기준 높이 추정 — 아직 안 그려진 칸에만 쓴다. 핀 카드면 `pinCardHeight`. */
  heightOf: (item: T) => number
  renderItem: (item: T) => ReactNode
  /** 기본 2. 바뀌면 처음부터 다시 놓는다. */
  columnCount?: number
}

/**
 * 다단 그리드 — 항목을 가장 낮은 열에 차례로 놓는다. 다음 쪽이 붙어도 놓인 항목은 안 옮긴다.
 * 그려진 칸은 실측 높이로, 안 그려진 칸만 `heightOf` 로 친다 — 다음 쪽이 실제로 가장 낮은 열부터 채운다.
 * 첫 렌더 뒤에 붙은 칸은 아래에서 살짝 떠오른다(동작 줄이기 설정이면 안 움직인다).
 * 간격은 `MASONRY_SPEC`. 스크롤 · 다음 쪽 받기는 소비처 몫이다.
 * @example
 * <Masonry items={pages.flat()} keyOf={(p) => p.id} heightOf={(p) => pinCardHeight(undefined, !!p.source)}
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
  const root = useRef<HTMLDivElement>(null)
  const placed = useRef(new Map<string, number>()).current
  /** 잰 높이 ÷ 폭 — 비율로 들고 있어야 열 수가 바뀌어도 그대로 쓴다. */
  const measured = useRef(new Map<string, number>()).current
  const delays = useRef<Map<string, number> | null>(null)
  const placedFor = useRef(columnCount)

  if (placedFor.current !== columnCount) {
    placed.clear()
    placedFor.current = columnCount
    // 열을 옮겨 다시 그려지는 칸이 또 떠오르지 않게 한다.
    for (const key of delays.current?.keys() ?? []) delays.current?.set(key, -1)
  }
  if (delays.current === null) delays.current = new Map(items.map((item) => [keyOf(item), -1]))
  let batch = 0
  for (const item of items) {
    const key = keyOf(item)
    if (delays.current.has(key)) continue
    delays.current.set(key, Math.min(batch++ * s.ENTER.staggerMs, s.ENTER.maxDelayMs))
  }

  // 콜백은 매 렌더 새로 오므로 의존성에서 뺀다 — 배치는 항목 · 열 수가 바뀔 때만 다시 한다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 위 주석
  const columns = useMemo(() => {
    const width = columnWidth(root.current, columnCount)
    const gap = width ? MASONRY_SPEC.rowGap / width : 0
    const sizeOf = (item: T) => (measured.get(keyOf(item)) ?? heightOf(item)) + gap
    return placeInColumns(items, columnCount, keyOf, sizeOf, placed)
  }, [items, columnCount, placed, measured])

  // biome-ignore lint/correctness/useExhaustiveDependencies: 새 칸이 그려지면(columns) 그 칸도 잰다
  useLayoutEffect(() => {
    const node = root.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const key = (entry.target as HTMLElement).dataset.masonryKey
        const box = entry.borderBoxSize[0]
        if (key && box?.inlineSize) measured.set(key, box.blockSize / box.inlineSize)
      }
    })
    for (const cell of node.querySelectorAll('[data-masonry-key]')) observer.observe(cell)
    return () => observer.disconnect()
  }, [columns, measured])

  return (
    <div ref={root} className={cx(s.root, className)} {...rest}>
      {columns.map((column, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 열은 자리 번호가 곧 정체다
        <div key={index} className={s.column}>
          {column.map((item) => {
            const key = keyOf(item)
            const delay = delays.current?.get(key) ?? -1
            return (
              <div
                key={key}
                data-masonry-key={key}
                className={delay >= 0 ? s.enter : undefined}
                style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
              >
                {renderItem(item)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** 열 하나의 폭(px). 아직 안 그려졌으면 0 — 그땐 전부 추정으로 친다. */
function columnWidth(node: HTMLDivElement | null, columnCount: number) {
  if (!node) return 0
  return (node.clientWidth - MASONRY_SPEC.columnGap * (columnCount - 1)) / columnCount
}
