import styled from '@emotion/native'
import type { ReactNode } from 'react'
import type { TouchableOpacityProps, ViewStyle } from 'react-native'
import { type ColorScheme, nativeRadius } from '../tokens/native'
import type { ButtonVariant } from './Button'
import { useScheme } from './scheme'

/**
 * 아이콘만 있는 정사각 액션. `Button` 과 **같은 variant 축**을 쓴다 — 색 어휘를 하나 더
 * 만들면 같은 `outline` 이 두 컴포넌트에서 다른 뜻이 될 수 있다.
 *
 * 크기가 `Button` 의 sm·md·cta 를 따르지 않는 이유: 저 축은 *라벨이 있는 컨트롤의 높이*고,
 * 여기는 **손가락이 닿는 정사각**이다. 44 는 iOS HIG 최소 터치 타깃이라 `md` 의 기본값으로
 * 둔다 — 시안 치수가 아니라 접근성 하한이다.
 */
export type IconButtonSize = 'sm' | 'md'

export interface IconButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant
  size?: IconButtonSize
  /** 스크린 리더용 이름. 아이콘만 있어 라벨이 없으므로 필수. */
  label: string
  children: ReactNode
}

const SIDE: Record<IconButtonSize, number> = { sm: 36, md: 44 }

const surfaceFor = (scheme: ColorScheme, variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: scheme.text }
    case 'ghost':
      return { backgroundColor: 'transparent' }
    case 'accent':
      return { backgroundColor: scheme.accent }
    case 'outline':
      return { backgroundColor: 'white', borderWidth: 1, borderColor: scheme.border }
  }
}

const Root = styled.TouchableOpacity<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: IconButtonSize
}>(({ $scheme, $variant, $size }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  width: SIDE[$size],
  height: SIDE[$size],
  borderRadius: nativeRadius.md,
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
      disabled={disabled}
      style={disabled ? { opacity: 0.4 } : undefined}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {children}
    </Root>
  )
}
