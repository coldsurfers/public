import { useEffect, useState } from 'react'
import { srOnly } from './Spinner.css'

/**
 * 한 글자씩 찍히는 텍스트. "지금 막 쓰이는 중"이라는 감각만 만들고 의미는 안 바꾼다.
 *
 * 접근성: 보이는 쪽은 `aria-hidden`, 스크린리더에는 처음부터 전문을 준다 —
 * 한 글자씩 바뀌는 DOM 을 읽히면 낭독이 엉킨다.
 * `prefers-reduced-motion: reduce` 면 연출 없이 즉시 전량 표시하고 `onDone` 도 바로 부른다.
 */
export interface TypewriterTextProps {
  text: string
  /** 글자 하나당 ms. 기본 18. */
  speed?: number
  /** 전량 표시가 끝난 뒤 한 번. 매 렌더 새로 만들면 처음부터 다시 찍히므로 `useCallback` 으로 넘긴다. */
  onDone?: () => void
  className?: string
}

export function TypewriterText({ text, speed = 18, onDone, className }: TypewriterTextProps) {
  const [shownCount, setShownCount] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || text.length === 0) {
      setShownCount(text.length)
      onDone?.()
      return
    }

    setShownCount(0)
    let count = 0
    const timer = window.setInterval(() => {
      count += 1
      setShownCount(count)
      if (count < text.length) return
      window.clearInterval(timer)
      onDone?.()
    }, speed)

    return () => window.clearInterval(timer)
  }, [text, speed, onDone])

  return (
    <span className={className}>
      <span aria-hidden>{text.slice(0, shownCount)}</span>
      <span className={srOnly}>{text}</span>
    </span>
  )
}
