import styled from '@emotion/native'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TouchableOpacity } from 'react-native'
import { BUTTON_SPEC, type ButtonVariant, ICON_BUTTON_SPEC, type IconButtonSize } from '../contract'
import { type ColorScheme, nativeRadius } from '../tokens/native'
import { surfaceFor } from './button-style'
import { useScheme } from './scheme'
import { AnimatedTouchable, usePressScale } from './usePressScale'

/**
 * 아이콘만 있는 정사각 액션. `Button` 과 **같은 variant 축**을 쓴다. 치수 정본은 `ICON_BUTTON_SPEC`
 * — 웹 `primitives/IconButton` 과 같은 표다.
 *
 * ref 는 `Button` 과 같은 경로로 딸려 온다(`ComponentPropsWithRef`).
 */
export type { IconButtonSize }

export interface IconButtonProps extends ComponentPropsWithRef<typeof TouchableOpacity> {
  variant?: ButtonVariant
  size?: IconButtonSize
  /** 스크린 리더용 이름. 아이콘만 있어 라벨이 없으므로 필수. */
  label: string
  children: ReactNode
}

const Root = styled(AnimatedTouchable)<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: IconButtonSize
  $disabled: boolean
}>(({ $scheme, $variant, $size, $disabled }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  width: ICON_BUTTON_SPEC.side[$size],
  height: ICON_BUTTON_SPEC.side[$size],
  borderRadius: nativeRadius[ICON_BUTTON_SPEC.radius],
  opacity: $disabled ? BUTTON_SPEC.disabledOpacity : 1,
  ...surfaceFor($scheme, $variant),
}))

export function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  disabled,
  children,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: IconButtonProps) {
  const scheme = useScheme()
  const press = usePressScale('small', { onPressIn, onPressOut, style })
  return (
    <Root
      $scheme={scheme}
      $variant={variant}
      $size={size}
      $disabled={disabled ?? false}
      disabled={disabled}
      activeOpacity={BUTTON_SPEC.pressedOpacity}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
      {...press}
    >
      {children}
    </Root>
  )
}
