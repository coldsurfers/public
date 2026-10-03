import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx } from './cx'
import {
  posterCard,
  posterCardDim,
  posterCardImage,
  posterCardMeta,
  posterCardTitle,
} from './PosterCard.css'

/**
 * 포스터 띠 · 그리드 한 칸 — 포스터 · 제목 · 한 줄 메타.
 * `src` 가 없으면 같은 비율의 빈 면이 남는다. `asChild` 면 자식 링크에 칸 스타일을 입힌다.
 */
export interface PosterCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  src?: string
  alt?: string
  title: ReactNode
  meta?: ReactNode
  /** 지난 공연 — 칸 전체를 흐린다 */
  past?: boolean
  asChild?: boolean
}

export function PosterCard({
  src,
  alt = '',
  title,
  meta,
  past = false,
  asChild,
  className,
  children,
  ...rest
}: PosterCardProps) {
  const body = (
    <>
      {src ? (
        <img className={posterCardImage} src={src} alt={alt} loading="lazy" />
      ) : (
        <span className={posterCardImage} />
      )}
      <span className={posterCardTitle}>{title}</span>
      {meta ? <span className={posterCardMeta}>{meta}</span> : null}
    </>
  )
  const cls = cx(posterCard, past ? posterCardDim : undefined, className)

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, { className: cx(cls, child.props.className) }, body)
  }

  return (
    <div className={cls} {...rest}>
      {body}
    </div>
  )
}
