import { style } from '@vanilla-extract/css'
import { inComponentsLayer } from '../css/component-layer'

/**
 * 표면 루트 — 화면을 채우는 세로 스택.
 *
 * `min-height: 100vh` 가 하는 일은 하나다: 콘텐츠가 짧은 표면(404·해지 완료 등)에서 푸터가
 * 화면 중간에 떠 있지 않게 한다. `Page.Content` 의 `flex: 1` 과 **짝으로만** 성립한다 —
 * 한쪽만 있으면 아무 효과가 없다. 둘이 갈라지는 자리를 없애는 게 이 컴포넌트의 존재 이유다.
 */
export const page = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  }),
)

/** `<main>` — 헤더와 푸터 사이의 남은 높이를 전부 먹는다. 위 `page` 와 짝. */
export const content = style(
  inComponentsLayer({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }),
)
