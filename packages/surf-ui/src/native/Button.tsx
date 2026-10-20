import styled from '@emotion/native'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TouchableOpacity } from 'react-native'
import {
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
  BUTTON_SPEC as spec,
} from '../contract'
import { type ColorScheme, fontWeight, nativeFontSize, nativeRadius } from '../tokens/native'
import { colorFor, surfaceFor } from './button-style'
import { useScheme } from './scheme'
import { AnimatedTouchable, usePressScale } from './usePressScale'

export type { ButtonShape, ButtonSize, ButtonVariant }

export interface ButtonProps extends ComponentPropsWithRef<typeof TouchableOpacity> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** 모서리 축. 웹 `Button` 과 같은 이름·같은 값. */
  shape?: ButtonShape
  /** 라벨 앞 아이콘 슬롯. 웹 `Button` 과 같은 이름·같은 자리. */
  leadingIcon?: ReactNode
  /** 라벨 뒤 아이콘 슬롯. 웹 `Button` 과 같은 이름·같은 자리. */
  trailingIcon?: ReactNode
  children?: ReactNode
}

/**
 * 치수 둘만 해석이 필요하다 — 스케일 안이면 토큰 맵에서, 밖이면 숫자 그대로(`cta` 만 후자).
 * `height`·`paddingInline` 은 `BUTTON_SPEC` 에서 이미 px 라 그대로 쓴다.
 */
function fontSizeFor(size: ButtonSize): number {
  const value = spec.size[size].fontSize
  return typeof value === 'number' ? value : nativeFontSize[value]
}

function weightFor(size: ButtonSize) {
  const s = spec.size[size]
  return 'fontWeight' in s ? s.fontWeight : spec.fontWeight
}

function radiusFor(size: ButtonSize, shape: ButtonShape): number {
  if (shape === 'pill') return nativeRadius[spec.pillRadius]
  const value = spec.size[size].radius
  return typeof value === 'number' ? value : nativeRadius[value]
}

const Root = styled(AnimatedTouchable)<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: ButtonSize
  $shape: ButtonShape
  $disabled: boolean
}>(({ $scheme, $variant, $size, $shape, $disabled }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spec.gap,
  height: spec.size[$size].height,
  paddingHorizontal: spec.size[$size].paddingInline,
  borderRadius: radiusFor($size, $shape),
  opacity: $disabled ? spec.disabledOpacity : 1,
  ...surfaceFor($scheme, $variant),
}))

/**
 * 라벨은 `Text` primitive 가 아니라 여기서 직접 만든다 — 색과 크기가 *텍스트의 계약*이
 * 아니라 *버튼의 계약*에서 나오기 때문이다.
 *
 * `lineHeight` 를 주지 않는다. 고정 높이 + 가운데 정렬이라 줄 높이가 위치를 정하지 않고,
 * 오히려 박으면 Android 에서 baseline 이 밀린다.
 */
const Label = styled.Text<{ $color: string; $size: ButtonSize }>(({ $color, $size }) => ({
  color: $color,
  fontSize: fontSizeFor($size),
  fontWeight: fontWeight[weightFor($size)],
  includeFontPadding: false,
}))

/**
 * 액션 버튼 — **웹 `primitives/Button` 과 같은 축**이다(variant 6 · size 4 · shape 2).
 * 치수와 variant→색 배정은 `contract/button.ts` 의 `BUTTON_SPEC` 이 정본이라 여기 숫자를
 * 손으로 적지 않는다. 축을 늘려야 하면 웹부터 늘리고 그다음 계약에 올린다.
 *
 * 웹의 `:hover` 는 짝이 없다 — RN 엔 hover 가 없다. 누름 투명도는 `BUTTON_SPEC.pressedOpacity`,
 * 누름 축소는 `PRESS_SPEC` — 넓은 `cta`·`lg` 는 `large`, 나머지는 `small`.
 *
 * ref 는 `ComponentPropsWithRef` 로 딸려 온다 — React 19 는 함수 컴포넌트에도 `ref` 를 그냥
 * prop 으로 넘기므로 `forwardRef` 가 필요 없다. 웹 `primitives` 는 아직 `forwardRef` 인데,
 * 그건 React 19 이전 코드라 그렇다(통일은 별건).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: ButtonProps) {
  const scheme = useScheme()
  const press = usePressScale(size === 'cta' || size === 'lg' ? 'large' : 'small', {
    onPressIn,
    onPressOut,
    style,
  })
  return (
    <Root
      $scheme={scheme}
      $variant={variant}
      $size={size}
      $shape={shape}
      $disabled={disabled ?? false}
      disabled={disabled}
      activeOpacity={spec.pressedOpacity}
      accessibilityRole="button"
      {...rest}
      {...press}
    >
      {leadingIcon}
      {typeof children === 'string' ? (
        <Label $color={colorFor(scheme, spec.variant[variant].label)} $size={size}>
          {children}
        </Label>
      ) : (
        children
      )}
      {trailingIcon}
    </Root>
  )
}
