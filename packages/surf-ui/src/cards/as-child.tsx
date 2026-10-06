import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cx } from '../primitives'

type Child = ReactElement<{ className?: string; children?: ReactNode }>

/**
 * `asChild` 줄 — 자식 하나(라우터 `Link` · `<a>` · `<button>`)를 줄의 겉으로 쓴다.
 * **자식의 글이 제목이 되고**, 줄의 나머지는 그 둘레에 그려진다 — 링크 이름이 곧 제목이라
 * 빈 `<a />` 가 생기지 않는다(스크린 리더 · `useAnchorContent` 린트).
 *
 * ```tsx
 * <InfoRow asChild meta="동대문구"><Link to="/venue/x">경희대 평화의전당</Link></InfoRow>
 * ```
 */
export function renderAsChild(
  child: ReactNode,
  className: string,
  layout: (title: ReactNode) => ReactNode,
  extra?: Record<string, unknown>,
): ReactElement | null {
  if (!isValidElement(child)) return null
  const el = child as Child
  return cloneElement(
    el,
    { ...extra, className: cx(className, el.props.className) },
    layout(el.props.children),
  )
}
