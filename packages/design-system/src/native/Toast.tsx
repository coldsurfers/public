import styled from '@emotion/native'
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react'
import type { ToastTone } from '../contract'
import { type ColorScheme, nativeRadius, nativeSpacing } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 하단 pill 토스트 — **웹 `primitives/Toast` 와 같은 API**(`ToastApi`·`ToastTone`·
 * `ToastProvider`·`useToast`). 화면 코드가 두 플랫폼에서 같은 문장으로 토스트를 띄운다.
 *
 * 색이 `bg-text / fg-bg` 한 쌍인 것도 웹과 같다 — 스킴이 뒤집히면 pill 도 같이 뒤집혀
 * 어느 표면에 얹혀도 바닥과 반대색이 된다. 그래서 표면마다 색을 따로 주지 않는다.
 *
 * provider 가 없으면 `show` 는 no-op — 컴포넌트를 격리 렌더해도 throw 하지 않는다(웹과 동일).
 */
export type { ToastTone }

export interface ToastApi {
  /** 메시지를 띄우고 1.6s 뒤 자동으로 사라진다. 연속 호출 시 타이머 리셋. */
  show: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 1.6s. 웹과 같은 시안 `DISMISS` 값. */
const DISMISS_MS = 1600

const Layer = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: nativeSpacing[10],
  alignItems: 'center',
  // 토스트는 알림이지 조작 대상이 아니다. 아래 화면의 탭을 가로막지 않는다.
  pointerEvents: 'none',
})

const Pill = styled.View<{ $scheme: ColorScheme }>(({ $scheme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: nativeSpacing[2],
  paddingHorizontal: nativeSpacing[4],
  paddingVertical: nativeSpacing[3],
  borderRadius: nativeRadius.full,
  backgroundColor: $scheme.text,
}))

const ErrorDot = styled.View<{ $scheme: ColorScheme }>(({ $scheme }) => ({
  width: 6,
  height: 6,
  borderRadius: nativeRadius.full,
  backgroundColor: $scheme.statusDanger,
}))

export function ToastProvider({ children }: { children: ReactNode }) {
  const scheme = useScheme()
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string, tone: ToastTone = 'neutral') => {
    setToast({ message, tone })
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, DISMISS_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Layer accessibilityLiveRegion="polite">
          <Pill $scheme={scheme}>
            {toast.tone === 'success' ? (
              <Text size="sm" style={{ color: scheme.bg }}>
                ✓
              </Text>
            ) : null}
            {toast.tone === 'error' ? <ErrorDot $scheme={scheme} /> : null}
            <Text size="sm" style={{ color: scheme.bg }}>
              {toast.message}
            </Text>
          </Pill>
        </Layer>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP
}

const NOOP: ToastApi = { show: () => {} }
