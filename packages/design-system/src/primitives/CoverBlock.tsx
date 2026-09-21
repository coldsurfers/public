import type { HTMLAttributes } from 'react'
import type { CoverSurfaceTone } from '../tokens'
import { coverBlock, coverForeground, coverTone } from './CoverBlock.css'
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
  /**
   * 색면 톤. **기본은 `note`** — 지향점이 그쪽이라 기본값이 그쪽이다.
   *
   * `note` 는 **아직 그림이 없다**는 상태의 면이다 — 이미지가 오는 중이거나, 없거나, 실패했다.
   * `Skeleton`(API 대기)과 같은 값을 읽으므로 기다림이 한 밝기로 선다.
   *
   * 팔레트 6톤은 **편집 표지**가 쓴다(`ArticleCard`·`LeadFeature`). 거긴 로딩 면이 아니라
   * 색 다양성이 곧 편집 디자인인 자리라 `coverToneFor` 로 흩는다. 공연 카드는 이 축을
   * 안 쓴다 — 그쪽은 면이 하나다.
   */
  tone?: CoverSurfaceTone
}

export function CoverBlock({ tone = 'note', className, children, ...rest }: CoverBlockProps) {
  return (
    <div className={cx(coverBlock, coverTone[tone], coverForeground[tone], className)} {...rest}>
      {children}
    </div>
  )
}
