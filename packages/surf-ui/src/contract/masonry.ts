/**
 * `Masonry` 의 계약. 규율은 `./index.ts`.
 *
 * 열 배치는 레인마다 다르다 — 웹은 아래 `placeInColumns`(추정 높이), native 는 FlashList 가
 * 실측 높이로 한다. 같아야 하는 건 간격과 열 수뿐이다.
 */
export const MASONRY_SPEC = {
  /** 열 사이 — 시안 v3. */
  columnGap: 12,
  /** 같은 열 카드 사이. */
  rowGap: 16,
  columnCount: 2,
} as const

/**
 * 항목을 가장 낮은 열에 차례로 놓는다.
 * @param placed 이미 놓인 항목의 열 — 다음 쪽이 붙어도 놓인 항목은 옮기지 않는다. 새 항목의 자리를 여기 채워 넣는다.
 * @example placeInColumns(items, 2, (x) => x.id, () => 1, new Map()) // [[0번, 2번 …], [1번, 3번 …]]
 */
export const placeInColumns = <T>(
  items: readonly T[],
  columnCount: number,
  keyOf: (item: T) => string,
  heightOf: (item: T) => number,
  placed: Map<string, number>,
): T[][] => {
  const columns: T[][] = Array.from({ length: columnCount }, () => [])
  const heights = new Array<number>(columnCount).fill(0)
  for (const item of items) {
    const key = keyOf(item)
    let column = placed.get(key)
    if (column === undefined || column >= columnCount) {
      column = heights.indexOf(Math.min(...heights))
      placed.set(key, column)
    }
    columns[column].push(item)
    heights[column] += heightOf(item)
  }
  return columns
}
