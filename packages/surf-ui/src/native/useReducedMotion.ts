import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** OS 의 「동작 줄이기」 설정. 바뀌면 따라온다. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    let alive = true
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value)
    })
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => {
      alive = false
      sub.remove()
    }
  }, [])
  return reduced
}
