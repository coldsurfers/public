import styled from '@emotion/native'
import { useCallback, useState } from 'react'
import type { TextInputProps as RNTextInputProps, TextInputFocusEvent } from 'react-native'
import { type ColorScheme, nativeFontSize, nativeRadius, nativeSpacing } from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 한 줄 입력. 웹은 `Field` 가 라벨·에러·입력을 한 묶음으로 들지만, RN 판은 **입력만** 든다 —
 * 라벨/에러 조판은 폼 레이아웃의 문제고 그건 화면마다 다르다. 두 번째 소비처가 같은 조판을
 * 요구할 때 `Field` 를 올린다.
 *
 * 포커스 테두리는 컨텍스트가 아니라 로컬 상태다. RN 엔 `:focus` 가 없어 누군가는 상태를
 * 들어야 하는데, 그 상태가 필요한 곳이 이 컴포넌트 하나뿐이다.
 */
export interface TextInputProps extends RNTextInputProps {
  /** 있으면 테두리를 danger 색으로. 메시지 렌더는 소비처의 몫. */
  invalid?: boolean
}

const Root = styled.TextInput<{ $scheme: ColorScheme; $focused: boolean; $invalid: boolean }>(
  ({ $scheme, $focused, $invalid }) => ({
    height: 48,
    paddingHorizontal: nativeSpacing[4],
    borderWidth: 1,
    borderRadius: nativeRadius.md,
    borderColor: $invalid ? $scheme.statusDanger : $focused ? $scheme.accent : $scheme.border,
    backgroundColor: $scheme.surface,
    color: $scheme.text,
    fontSize: nativeFontSize.base,
    includeFontPadding: false,
  }),
)

export function TextInput({ invalid = false, onFocus, onBlur, ...rest }: TextInputProps) {
  const scheme = useScheme()
  const [focused, setFocused] = useState(false)

  const handleFocus = useCallback(
    (event: TextInputFocusEvent) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: TextInputFocusEvent) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  return (
    <Root
      $scheme={scheme}
      $focused={focused}
      $invalid={invalid}
      placeholderTextColor={scheme.subtle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  )
}
