import type { HTMLAttributes } from 'react'
import type { CoverTone } from '../tokens'
import { coverBlock, coverTone } from './CoverBlock.css'
import { cx } from './cx'

/**
 * 카드 커버 블록 — 시안의 `지형(terrain)` 색면. 위에 이니셜·Badge 가 얹힌다.
 * 높이는 소비처가 정한다(ConcertCard 190/160 · ArticleCard 200/150).
 *
 * 색면이 아닌 다른 표면(예: `DemoCard` 의 아바타 원)도 같은 팔레트를 쓰므로 `coverTone` 을
 * 재수출한다 — 소비처가 색만 필요할 때 쓴다.
 */
export { coverTone }

export interface CoverBlockProps extends HTMLAttributes<HTMLDivElement> {
  tone: CoverTone
}

export function CoverBlock({ tone, className, children, ...rest }: CoverBlockProps) {
  return (
    <div className={cx(coverBlock, coverTone[tone], className)} {...rest}>
      {children}
    </div>
  )
}
