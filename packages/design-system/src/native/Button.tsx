import styled from '@emotion/native'
import type { ReactNode } from 'react'
import type { TouchableOpacityProps, ViewStyle } from 'react-native'
import {
  type ColorScheme,
  fontWeight,
  nativeFontSize,
  nativeRadius,
  nativeSpacing,
} from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 액션 버튼 — **웹 `primitives/Button` 과 같은 축**이다(variant 4 · size 3).
 * 두 플랫폼이 같은 prop 계약을 쓰는 것이 이 레인의 전제라, 여기서 축을 늘리거나 이름을
 * 바꾸면 계약이 갈라진다. 축을 늘려야 하면 웹부터 늘린다.
 *
 * 웹의 `:hover` 자리는 `TouchableOpacity` 의 누름 투명도가 대신한다 — RN 엔 hover 가 없고,
 * 누름 피드백은 플랫폼이 이미 갖고 있다.
 *
 * 높이는 `height` 로 박는다. 웹 `Button.css.ts` 의 §높이 규율과 같은 이유이자, RN 에서는
 * 더 강하다 — 세로 padding 으로 높이를 만들면 폰트 메트릭이 달라지는 iOS/Android 에서
 * 같은 버튼이 다른 높이로 선다.
 */
export type ButtonVariant = 'primary' | 'ghost' | 'accent' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'cta'

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** 라벨 뒤 아이콘 슬롯. 웹 `Button` 과 같은 이름·같은 자리. */
  trailingIcon?: ReactNode
  children?: ReactNode
}

/**
 * 치수는 웹 `Button.css.ts` 와 같은 값이다(36·52·46 / 16·24·22).
 * `cta` 의 15px 은 스케일 밖 리터럴 — 토큰이 12.5~17px 구간을 의도적으로 접었고,
 * 그 결정을 시안 CTA 한 자리 때문에 뒤집지 않는다(`tokens.ts` 타이포 스케일 주석).
 */
const SIZES = {
  sm: {
    height: 36,
    paddingHorizontal: nativeSpacing[4],
    fontSize: nativeFontSize.sm,
    radius: nativeRadius.md,
  },
  md: {
    height: 52,
    paddingHorizontal: nativeSpacing[6],
    fontSize: nativeFontSize.base,
    radius: nativeRadius.lg,
  },
  cta: { height: 46, paddingHorizontal: 22, fontSize: 15, radius: 10 },
} as const

/** 웹 variant 표와 1:1. `accent` 의 흰 글씨는 웹과 같은 리터럴이다(스킴을 안 탄다). */
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

const labelColorFor = (scheme: ColorScheme, variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
      return scheme.bg
    case 'ghost':
      return scheme.body
    case 'accent':
      return 'white'
    case 'outline':
      return scheme.text
  }
}

const Root = styled.TouchableOpacity<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: ButtonSize
}>(({ $scheme, $variant, $size }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: nativeSpacing[2],
  height: SIZES[$size].height,
  paddingHorizontal: SIZES[$size].paddingHorizontal,
  borderRadius: SIZES[$size].radius,
  ...surfaceFor($scheme, $variant),
}))

/**
 * 라벨은 `Text` primitive 가 아니라 여기서 직접 만든다 — 색과 크기가 *텍스트의 계약*이
 * 아니라 *버튼의 계약*에서 나오기 때문이다.
 *
 * `lineHeight` 를 주지 않는다. 고정 높이 + 가운데 정렬이라 줄 높이가 위치를 정하지 않고,
 * 오히려 박으면 Android 에서 baseline 이 밀린다.
 */
const Label = styled.Text<{ $color: string; $fontSize: number }>(({ $color, $fontSize }) => ({
  color: $color,
  fontSize: $fontSize,
  fontWeight: fontWeight.medium,
  includeFontPadding: false,
}))

export function Button({
  variant = 'primary',
  size = 'md',
  trailingIcon,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const scheme = useScheme()
  return (
    <Root
      $scheme={scheme}
      $variant={variant}
      $size={size}
      disabled={disabled}
      style={disabled ? { opacity: 0.4 } : undefined}
      accessibilityRole="button"
      {...rest}
    >
      {typeof children === 'string' ? (
        <Label $color={labelColorFor(scheme, variant)} $fontSize={SIZES[size].fontSize}>
          {children}
        </Label>
      ) : (
        children
      )}
      {trailingIcon}
    </Root>
  )
}
