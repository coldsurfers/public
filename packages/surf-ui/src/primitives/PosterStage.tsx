import type { HTMLAttributes } from 'react'
import { cx } from './cx'
import { posterStage, posterStageGlow, posterStageImage } from './PosterStage.css'

/**
 * 첫 화면의 무대 — 큰 포스터 하나와 뒤 번짐.
 * 번짐 색은 `--tint-glow` 다. 앱이 포스터에서 뽑은 색으로 화면 단위에서 덮는다.
 */
export interface PosterStageProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
}

export function PosterStage({ src, alt = '', className, ...rest }: PosterStageProps) {
  return (
    <div className={cx(posterStage, className)} {...rest}>
      <span className={posterStageGlow} aria-hidden="true" />
      {src ? (
        <img className={posterStageImage} src={src} alt={alt} />
      ) : (
        <span className={posterStageImage} />
      )}
    </div>
  )
}
