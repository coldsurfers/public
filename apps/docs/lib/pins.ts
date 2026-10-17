/**
 * 홈 보드의 묶음. 순서가 곧 칩 순서다. 폴더 밖 최상위 문서는 `start` 로 모은다.
 * `source` 를 물지 않는다 — 클라이언트 보드가 이 파일을 import 한다.
 */
export const BOARDS = {
  start: { label: '시작', tone: 'ink' },
  foundations: { label: 'Foundations', tone: 'lavender' },
  components: { label: 'Components', tone: 'plum' },
  patterns: { label: 'Patterns', tone: 'peach' },
  native: { label: 'Native', tone: 'mint' },
  screens: { label: 'Screens', tone: 'lavender' },
} as const

export type BoardKey = keyof typeof BOARDS
export type PinTone = (typeof BOARDS)[BoardKey]['tone']

export interface Pin {
  href: string
  title: string
  meta: string
  board: BoardKey
}

/** 슬러그가 아니라 파일 경로로 가른다 — `screens/index.mdx` 는 슬러그가 `['screens']` 하나라 최상위처럼 보인다. */
export function toBoard(path: string): BoardKey | undefined {
  const [head, ...rest] = path.split('/')
  if (rest.length === 0) return 'start'

  return head in BOARDS ? (head as BoardKey) : undefined
}
