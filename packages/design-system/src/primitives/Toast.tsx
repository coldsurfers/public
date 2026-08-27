import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { toastErrorDot, toastMessage, toast as toastStyle } from './Toast.css'

/**
 * 하단 중앙 pill 토스트 — 액션 결과("저장했다")를 1.6초 알리고 사라진다.
 * Figma Page 7 `Toast — 규격·변형`(990:2) 시안.
 *
 * 색은 `bg-text text-bg` 한 쌍이다 — 스킴이 뒤집히면 pill 도 같이 뒤집혀서 **어느 표면에
 * 얹혀도 바닥과 반대색**이 된다. warm-paper 표면(설정·라이브)에선 ink pill + paper 글씨,
 * SNS 다크에선 paper pill + ink 글씨. 표면마다 색을 따로 주지 않는 이유다.
 *
 * provider 가 없으면 `show` 는 no-op — 컴포넌트를 격리 렌더해도 throw 하지 않는다.
 */
export type ToastTone = 'neutral' | 'success' | 'error'

export interface ToastApi {
  /** 메시지를 띄우고 1.6s 뒤 자동으로 사라진다. 연속 호출 시 타이머 리셋. */
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 1.6s. 시안 `DISMISS` 값. */
const DISMISS_MS = 1600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null)
  const timerRef = useRef<number | null>(null)

  const show = useCallback((message: string, tone: ToastTone = 'neutral') => {
    setToast({ message, tone })
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, DISMISS_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div role="status" aria-live="polite" className={toastStyle({ visible: Boolean(toast) })}>
        {toast?.tone === 'success' ? <span aria-hidden>✓</span> : null}
        {toast?.tone === 'error' ? <span aria-hidden className={toastErrorDot} /> : null}
        <span className={toastMessage}>{toast?.message}</span>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP
}

const NOOP: ToastApi = { show: () => {} }
