import styled from '@emotion/native'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TouchableOpacity } from 'react-native'
import { type ButtonSize, type ButtonVariant, BUTTON_SPEC as spec } from '../contract'
import { type ColorScheme, fontWeight, nativeFontSize, nativeRadius } from '../tokens/native'
import { colorFor, DISABLED_OPACITY, surfaceFor } from './button-style'
import { useScheme } from './scheme'

export type { ButtonSize, ButtonVariant }

export interface ButtonProps extends ComponentPropsWithRef<typeof TouchableOpacity> {
  variant?: ButtonVariant
  size?: ButtonSize
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

function radiusFor(size: ButtonSize): number {
  const value = spec.size[size].radius
  return typeof value === 'number' ? value : nativeRadius[value]
}

const Root = styled.TouchableOpacity<{
  $scheme: ColorScheme
  $variant: ButtonVariant
  $size: ButtonSize
  $disabled: boolean
}>(({ $scheme, $variant, $size, $disabled }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spec.gap,
  height: spec.size[$size].height,
  paddingHorizontal: spec.size[$size].paddingInline,
  borderRadius: radiusFor($size),
  opacity: $disabled ? DISABLED_OPACITY : 1,
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
  fontWeight: fontWeight[spec.fontWeight],
  includeFontPadding: false,
}))

/**
 * 액션 버튼 — **웹 `primitives/Button` 과 같은 축**이다(variant 5 · size 3).
 * 치수와 variant→색 배정은 `contract/button.ts` 의 `BUTTON_SPEC` 이 정본이라 여기 숫자를
 * 손으로 적지 않는다. 축을 늘려야 하면 웹부터 늘리고 그다음 계약에 올린다.
 *
 * 웹의 `:hover` 자리는 `TouchableOpacity` 의 누름 투명도가 대신한다 — RN 엔 hover 가 없고,
 * 누름 피드백은 플랫폼이 이미 갖고 있다.
 *
 * ref 는 `ComponentPropsWithRef` 로 딸려 온다 — React 19 는 함수 컴포넌트에도 `ref` 를 그냥
 * prop 으로 넘기므로 `forwardRef` 가 필요 없다. 웹 `primitives` 는 아직 `forwardRef` 인데,
 * 그건 React 19 이전 코드라 그렇다(통일은 별건).
 */
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
      $disabled={disabled ?? false}
      disabled={disabled}
      accessibilityRole="button"
      {...rest}
    >
      {typeof children === 'string' ? (
        <Label $color={colorFor(scheme, spec.variant[variant].label)} $fontSize={fontSizeFor(size)}>
          {children}
        </Label>
      ) : (
        children
      )}
      {trailingIcon}
    </Root>
  )
}
