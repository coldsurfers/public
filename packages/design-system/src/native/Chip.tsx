import styled from '@emotion/native'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TouchableOpacity, ViewStyle } from 'react-native'
import { type ChipSize, CHIP_SPEC as spec } from '../contract'
import { type ColorScheme, fontWeight, nativeFontSize, nativeRadius } from '../tokens/native'
import { useScheme } from './scheme'

/**
 * Pill — **웹 `primitives/Chip` 과 같은 축**이다(size 2 · active). 치수와 색 배정은
 * `contract/chip.ts` 의 `CHIP_SPEC` 이 정본이라 여기 숫자를 손으로 적지 않는다.
 *
 * ## 웹과 무엇이 다른가
 *
 * **없는 prop 셋** — `as`(`button`/`span`) · `asChild` · `className`. RN 엔 갈 자리가 없다.
 * 좁혀서 옮긴 게 아니라 *상대가 없는* 축이라, 있는데 안 먹는 prop 을 두지 않는다.
 * 웹에서 `asChild` 로 라우터 링크를 감싸던 자리는 RN 에서 `onPress` 가 맡는다.
 *
 * **`:hover`·`transition` 이 없다.** 누름 피드백은 `TouchableOpacity` 의 투명도가 이미 준다.
 *
 * ## 아이콘을 넣는 방법
 *
 * 웹은 CSS 가 텍스트 스타일을 상속시켜 `<Dot/>{'서울'}` 이 그냥 되지만 RN 은 안 된다 —
 * 문자열은 `Text` 안에 있어야 한다. 그래서 **문자열 children 만** 라벨로 감싸고 나머지는
 * 그대로 통과시킨다(`Button` 과 같은 처리). 아이콘 + 라벨을 함께 넣는 자리는 소비처가
 * 자기 `View` 로 조립해 넘긴다 — 웹 Chip 에 `gap` 축이 없으므로 여기서 만들지 않는다.
 */
export type { ChipSize }

export interface ChipProps extends ComponentPropsWithRef<typeof TouchableOpacity> {
  size?: ChipSize
  /** 선택 상태 — ink 필 + paper 텍스트(반전). 시안 언어의 정본은 웹 `Chip.tsx` 주석. */
  active?: boolean
  children?: ReactNode
}

/** `CHIP_SPEC` 의 색 표와 1:1 — 비활성일 때만 size 로 갈린다. */
const surfaceFor = (scheme: ColorScheme, size: ChipSize, active: boolean): ViewStyle => {
  if (active) return { backgroundColor: scheme.text, borderColor: 'transparent' }
  return size === 'md'
    ? { backgroundColor: scheme.surface, borderColor: scheme.border }
    : { backgroundColor: scheme.surface2, borderColor: 'transparent' }
}

const labelColorFor = (scheme: ColorScheme, size: ChipSize, active: boolean): string => {
  if (active) return scheme.bg
  return size === 'md' ? scheme.body : scheme.muted
}

const Root = styled.TouchableOpacity<{
  $scheme: ColorScheme
  $size: ChipSize
  $active: boolean
}>(({ $scheme, $size, $active }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: spec.size[$size].height,
  paddingHorizontal: spec.size[$size].paddingInline,
  borderRadius: nativeRadius[spec.size[$size].radius],
  borderWidth: spec.size[$size].borderWidth,
  ...surfaceFor($scheme, $size, $active),
}))

/**
 * 라벨은 `Text` primitive 가 아니라 여기서 직접 만든다 — 색과 크기가 *텍스트의 계약*이 아니라
 * *필의 계약*에서 나온다(`Button` 과 같은 이유). `lineHeight` 를 주지 않는 것도 같다:
 * 고정 높이 + 가운데 정렬이라 줄 높이가 위치를 정하지 않고, 박으면 Android baseline 이 밀린다.
 */
const Label = styled.Text<{ $color: string; $size: ChipSize }>(({ $color, $size }) => ({
  color: $color,
  fontSize: nativeFontSize[spec.size[$size].fontSize],
  fontWeight: fontWeight[spec.fontWeight],
  includeFontPadding: false,
}))

export function Chip({ size = 'md', active = false, children, ...rest }: ChipProps) {
  const scheme = useScheme()
  return (
    <Root
      $scheme={scheme}
      $size={size}
      $active={active}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Label
          $color={labelColorFor(scheme, size, active)}
          $size={size}
          numberOfLines={spec.labelLines}
        >
          {children}
        </Label>
      ) : (
        children
      )}
    </Root>
  )
}
