import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { TOAST_TIMING, type ToastOptions, type ToastTone } from '../contract'
import {
  toastAction,
  toastCopy,
  toastDescription,
  toastErrorDot,
  toastMessage,
  toast as toastStyle,
} from './Toast.css'

/**
 * 하단 중앙 pill 토스트 — 액션 결과("저장했다")를 1.6초 알리고 사라진다.
 * Figma Page 7 `Toast — 규격·변형`(990:2) 시안.
 *
 * 색은 `bg-text text-bg` 한 쌍이다 — 스킴이 뒤집히면 pill 도 같이 뒤집혀서 **어느 표면에
 * 얹혀도 바닥과 반대색**이 된다. warm-paper 표면(설정·라이브)에선 ink pill + paper 글씨,
 * SNS 다크에선 paper pill + ink 글씨. 표면마다 색을 따로 주지 않는 이유다.
 *
 * `description` 이 있으면 두 줄 상자, `action` 이 있으면 오른쪽 끝에 누를 수 있는 한 걸음이
 * 붙고 4초 선다(Figma `3743:1364`). 액션을 누르면 토스트가 닫힌다.
 *
 * provider 가 없으면 `show` 는 no-op — 컴포넌트를 격리 렌더해도 throw 하지 않는다.
 */
export type { ToastOptions, ToastTone }

export interface ToastApi {
  /**
   * 메시지를 띄우고 1.6s(액션이 있으면 4s) 뒤 자동으로 사라진다. 연속 호출 시 타이머 리셋.
   */
  show: (message: string, tone?: ToastTone, options?: ToastOptions) => void
}

type ToastState = { message: string; tone: ToastTone } & ToastOptions

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<number | null>(null)

  const hide = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = null
    setToast(null)
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'neutral', options?: ToastOptions) => {
      setToast({ message, tone, ...options })
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(
        hide,
        options?.action ? TOAST_TIMING.actionDismissMs : TOAST_TIMING.dismissMs,
      )
    },
    [hide],
  )

  const action = toast?.action

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={toastStyle({ visible: Boolean(toast), stacked: Boolean(toast?.description) })}
      >
        {toast?.tone === 'success' ? <span aria-hidden>✓</span> : null}
        {toast?.tone === 'error' ? <span aria-hidden className={toastErrorDot} /> : null}
        <span className={toastCopy}>
          <span className={toastMessage}>{toast?.message}</span>
          {toast?.description ? (
            <span className={toastDescription}>{toast.description}</span>
          ) : null}
        </span>
        {action ? (
          <button
            type="button"
            className={toastAction}
            onClick={() => {
              hide()
              action.onPress()
            }}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP
}

const NOOP: ToastApi = { show: () => {} }
