'use client'
import { useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

/**
 * 클립보드 복사와 그 결과 표시. 연달아 눌러도 마지막 결과만 1.5초 보인다.
 * @returns 실패(권한 · 비보안 출처)도 상태로 돌려준다 — 조용히 삼키지 않는다.
 */
export function useCopy() {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy(value: string) {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
    timer.current = setTimeout(() => setState('idle'), 1500)
  }

  return { state, copy }
}
