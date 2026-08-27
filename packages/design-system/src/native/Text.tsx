import styled from '@emotion/native'
import type { TextProps as RNTextProps } from 'react-native'
import {
  type ColorScheme,
  type FontSizeKey,
  type FontWeightKey,
  fontWeight,
  type LineHeightKey,
  lineHeightFor,
  nativeFontFamily,
  nativeFontSize,
} from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 텍스트 바닥. RN 은 모든 글자가 `<Text>` 안에 있어야 해서 웹과 달리 이게 primitive 다
 * (웹은 같은 자리를 sprinkles 유틸이 맡는다).
 *
 * `lineHeight` 를 반드시 채우는 이유: RN 은 기본 line height 를 폰트 메트릭에서 가져와
 * 서체마다 다르게 준다. 토큰 배수를 `lineHeightFor` 로 절대값화해 박아야 같은 시안이
 * iOS·Android 에서 같은 높이로 선다.
 *
 * ⚠️ **`fontWeight` 는 가변 폰트가 등록돼 있을 때만 먹는다.** Pretendard 를 weight 별
 * 파일(`Pretendard-Bold` 등)로 등록한 앱에서는 `fontFamily` 를 그 이름으로 바꿔야 하고,
 * 이 축은 무시된다. 등록 방식은 앱의 결정이라 DS 는 토큰이 말하는 가변 폰트를 전제한다.
 */
export type TextTone = 'text' | 'strong' | 'body' | 'muted' | 'subtle' | 'faint' | 'accent'

export interface TextProps extends RNTextProps {
  size?: FontSizeKey
  weight?: FontWeightKey
  leading?: LineHeightKey
  tone?: TextTone
  family?: keyof typeof nativeFontFamily
}

const Root = styled.Text<{
  $scheme: ColorScheme
  $size: FontSizeKey
  $weight: FontWeightKey
  $leading: LineHeightKey
  $tone: TextTone
  $family: keyof typeof nativeFontFamily
}>(({ $scheme, $size, $weight, $leading, $tone, $family }) => ({
  color: $scheme[$tone],
  fontFamily: nativeFontFamily[$family],
  fontSize: nativeFontSize[$size],
  fontWeight: fontWeight[$weight],
  lineHeight: lineHeightFor($size, $leading),
  // Android 가 폰트 위아래에 얹는 여백. 켜 두면 같은 시안이 iOS 보다 두껍게 선다.
  includeFontPadding: false,
}))

export function Text({
  size = 'base',
  weight = 'regular',
  leading = 'normal',
  tone = 'body',
  family = 'sans',
  ...rest
}: TextProps) {
  const scheme = useScheme()
  return (
    <Root
      $scheme={scheme}
      $size={size}
      $weight={weight}
      $leading={leading}
      $tone={tone}
      $family={family}
      {...rest}
    />
  )
}
