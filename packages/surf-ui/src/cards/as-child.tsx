import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cx } from '../primitives'

/**
 * `asChild` 줄 — 자식 하나(라우터 `Link` · `<a>` · `<button>`)에 클래스를 입히고 내용을 그 안에 넣는다.
 * 줄 전체가 링크인 부품(`MediaRow` · `InfoRow` · `LinkBand`)이 라우터를 물지 않게 하는 자리.
 */
export function renderAsChild(
  child: ReactNode,
  className: string,
  content: ReactNode,
  extra?: Record<string, unknown>,
): ReactElement | null {
  if (!isValidElement(child)) return null
  const el = child as ReactElement<{ className?: string; children?: ReactNode }>
  return cloneElement(el, { ...extra, className: cx(className, el.props.className) }, content)
}
