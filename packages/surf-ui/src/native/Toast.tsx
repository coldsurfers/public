import styled from '@emotion/native'
import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { TOAST_SPEC as spec, TOAST_TIMING, type ToastOptions, type ToastTone } from '../contract'
import { type ColorScheme, nativeColor, nativeRadius, nativeSpacing } from '../tokens/native'
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
export type { ToastOptions, ToastTone }

export interface ToastApi {
  /**
   * 메시지를 띄우고 1.6s(액션이 있으면 4s) 뒤 자동으로 사라진다. 연속 호출 시 타이머 리셋.
   */
  show: (message: string, tone?: ToastTone, options?: ToastOptions) => void
}

type ToastState = { message: string; tone: ToastTone } & ToastOptions

const ToastContext = createContext<ToastApi | null>(null)

const Layer = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: nativeSpacing[10],
  alignItems: 'center',
  // 토스트는 알림이지 조작 대상이 아니다. 아래 화면의 탭을 가로막지 않는다 — 액션만 예외라
  // `box-none` 으로 자식의 터치는 살린다.
  pointerEvents: 'box-none',
})

const Pill = styled.View<{ $scheme: ColorScheme; $stacked: boolean }>(({ $scheme, $stacked }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: spec.gap[$stacked ? 'stacked' : 'single'],
  paddingHorizontal: spec.paddingInline,
  paddingVertical: spec.paddingBlock,
  borderRadius: $stacked ? spec.radius.stacked : nativeRadius[spec.radius.single],
  backgroundColor: $scheme.textPrimary,
  ...($stacked ? { alignSelf: 'stretch', marginHorizontal: nativeSpacing[4] } : null),
}))

// `flex: 1` 은 두 줄일 때만 — RN 에선 `flexBasis: 0` 까지 걸려서, 내용 폭만큼 잡히는 한 줄 pill
// 안에선 이 칸이 0 으로 접히거나 끝까지 늘어난다.
const Copy = styled.View<{ $stacked: boolean }>(({ $stacked }) => ({
  gap: spec.copyGap,
  minWidth: 0,
  ...($stacked ? { flex: 1 } : null),
}))

const Action = styled.TouchableOpacity({ flexShrink: 0 })

const ErrorDot = styled.View<{ $scheme: ColorScheme }>(({ $scheme }) => ({
  width: spec.dotSize,
  height: spec.dotSize,
  borderRadius: nativeRadius.full,
  // 상태색이 아니라 `accent` 인 이유는 ink pill 위 대비다 — `contract/toast.ts` 의 색 표.
  backgroundColor: $scheme.actionPrimary,
}))

export function ToastProvider({ children }: { children: ReactNode }) {
  const scheme = useScheme()
  const [toast, setToast] = useState<ToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hide = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
    setToast(null)
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'neutral', options?: ToastOptions) => {
      setToast({ message, tone, ...options })
      if (timerRef.current !== null) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(
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
      {toast ? (
        <Layer accessibilityLiveRegion="polite">
          {/* 보조 글자 · 링크의 `nativeColor.ink.*` 는 스킴이 light 로 잠긴 전제다 — 잠금이 풀리면 pill 밝기를 따라 고른다(contract/toast.ts 색 표). */}
          <Pill $scheme={scheme} $stacked={Boolean(toast.description)}>
            {toast.tone === 'success' ? (
              <Text size="sm" style={{ color: scheme.bgBase }}>
                ✓
              </Text>
            ) : null}
            {toast.tone === 'error' ? <ErrorDot $scheme={scheme} /> : null}
            <Copy $stacked={Boolean(toast.description)}>
              <Text
                size={spec.message.fontSize}
                weight={spec.message.fontWeight}
                numberOfLines={1}
                style={{ color: scheme.bgBase }}
              >
                {toast.message}
              </Text>
              {toast.description ? (
                <Text
                  size={spec.description.fontSize}
                  weight={spec.description.fontWeight}
                  numberOfLines={1}
                  style={{ color: nativeColor.ink.textSecondary }}
                >
                  {toast.description}
                </Text>
              ) : null}
            </Copy>
            {toast.action ? (
              <Action
                accessibilityRole="button"
                onPress={() => {
                  hide()
                  action?.onPress()
                }}
              >
                <Text
                  size={spec.action.fontSize}
                  weight={spec.action.fontWeight}
                  style={{ color: nativeColor.ink.kicker }}
                >
                  {toast.action.label}
                </Text>
              </Action>
            ) : null}
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
