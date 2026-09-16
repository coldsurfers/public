import styled from '@emotion/native'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TouchableOpacity } from 'react-native'
import type { ButtonVariant } from '../contract'
import { type ColorScheme, nativeRadius } from '../tokens/native'
import { DISABLED_OPACITY, surfaceFor } from './button-style'
import { useScheme } from './scheme'

/**
 * 아이콘만 있는 정사각 액션. `Button` 과 **같은 variant 축**을 쓴다 — 색 어휘를 하나 더
 * 만들면 같은 `outline` 이 두 컴포넌트에서 다른 뜻이 될 수 있다.
 *
 * ref 는 `Button` 과 같은 경로로 딸려 온다(`ComponentPropsWithRef`).
 *
 * 크기가 `Button` 의 sm·md·cta 를 따르지 않는 이유: 저 축은 *라벨이 있는 컨트롤의 높이*고,
 * 여기는 **손가락이 닿는 정사각**이다. 44 는 iOS HIG 최소 터치 타깃이라 `md` 의 기본값으로
 * 둔다 — 시안 치수가 아니라 접근성 하한이다.
 */
export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps extends ComponentPropsWithRef<typeof TouchableOpacity> {
  variant?: ButtonVariant
  size?: IconButtonSize
  /** 스크린 리더용 이름. 아이콘만 있어 라벨이 없으므로 필수. */
  label: string
  children: ReactNode
}

const SIDE: Record<IconButtonSize, number> = { sm: 36, md: 44 }

const Root = styled.TouchableOpacity<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: IconButtonSize
  $disabled: boolean
}>(({ $scheme, $variant, $size, $disabled }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  width: SIDE[$size],
  height: SIDE[$size],
  borderRadius: nativeRadius.md,
  opacity: $disabled ? DISABLED_OPACITY : 1,
  ...surfaceFor($scheme, $variant),
}))

export function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  disabled,
  children,
  ...rest
}: IconButtonProps) {
  const scheme = useScheme()
  return (
    <Root
      $scheme={scheme}
      $variant={variant}
      $size={size}
      $disabled={disabled ?? false}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {children}
    </Root>
  )
}
