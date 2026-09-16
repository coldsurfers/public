import styled from '@emotion/native'
import type { ReactNode } from 'react'
import { Modal as RNModal } from 'react-native'
import { type ColorScheme, nativeRadius, nativeSpacing } from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 백드롭 + 패널 다이얼로그. 웹 `primitives/Modal` 과 같은 축(`open`·`onClose`·`label`·
 * `dismissible`)을 쓴다.
 *
 * 웹판이 감당하던 것 중 **여기서 사라지는 것들**: portal(RN `Modal` 이 이미 네이티브
 * 최상위로 올린다) · focus trap · scroll lock · Escape. 셋 다 RN 엔 개념이 없거나
 * 플랫폼이 이미 처리한다. 그래서 `useDialogBehavior` 의 native 대응은 만들지 않는다 —
 * 대응물이 없는 훅을 이름만 맞춰 두면 있는 줄 알고 기대하게 된다.
 *
 * Android 하드웨어 뒤로가기는 `onRequestClose` 로 붙는다(`dismissible` 을 따른다).
 *
 * ## `label` 은 `RNModal` 이 아니라 `Panel` 이 든다
 *
 * RN 의 `Modal` 은 받은 props 를 네이티브 뷰로 **명시 목록만** 넘긴다
 * (`react-native/Libraries/Modal/Modal.js` 의 `RCTModalHostView` 호출부 — `visible`·
 * `transparent`·`onRequestClose`·`testID` 등). `accessibilityLabel` 은 그 목록에 없고,
 * 내부 `View` 도 `style` 만 받는다. 그런데 `ModalProps` 가 `ViewProps` 를 extends 해서
 * **타입은 통과한다** — 넘겨놓고 버려지는 걸 아무도 안 막는다.
 *
 * 그래서 다이얼로그 이름은 실제 표면인 `Panel` 이 든다. prop 이름 셋이 웹과 글자 그대로
 * 같다(`role`·`aria-modal`·`aria-label`) — RN 0.71+ 이 같은 이름을 받는다.
 * `aria-modal` 은 iOS 의 `accessibilityViewIsModal` 로 내려가 뒤 화면을 접근성 트리에서
 * 빼고, Android 는 `RNModal` 이 이미 네이티브 다이얼로그 창이라 같은 일을 한다.
 */
export interface ModalProps {
  open: boolean
  onClose: () => void
  /** 스크린 리더용 다이얼로그 이름. */
  label: string
  /** false 면 백드롭 탭·뒤로가기를 무시한다(처리 중 잠금). 기본 true. */
  dismissible?: boolean
  children: ReactNode
}

const Backdrop = styled.Pressable({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: nativeSpacing[6],
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
})

const Panel = styled.View<{ $scheme: ColorScheme }>(({ $scheme }) => ({
  width: '100%',
  maxWidth: 420,
  padding: nativeSpacing[6],
  borderRadius: nativeRadius.xl,
  backgroundColor: $scheme.surface,
}))

export function Modal({ open, onClose, label, dismissible = true, children }: ModalProps) {
  const scheme = useScheme()
  const dismiss = dismissible ? onClose : undefined

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={dismiss}>
      <Backdrop onPress={dismiss} accessibilityRole="none">
        {/* 패널 탭이 백드롭까지 올라가 닫히지 않도록 여기서 이벤트를 끊는다. */}
        <Panel
          $scheme={scheme}
          onStartShouldSetResponder={() => true}
          role="dialog"
          aria-modal
          aria-label={label}
        >
          {children}
        </Panel>
      </Backdrop>
    </RNModal>
  )
}
