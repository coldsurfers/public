import styled from '@emotion/native'
import type { TextProps as RNTextProps } from 'react-native'
import { TEXT_STYLE_SPEC, type TextStyleName, type TextTone } from '../contract/text-style'
import {
  type ColorScheme,
  type FontSizeKey,
  type FontWeightKey,
  fontWeight,
  type LetterSpacingKey,
  type LineHeightKey,
  letterSpacingFor,
  lineHeightFor,
  nativeFontFamily,
  nativeFontSize,
} from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 텍스트 바닥. RN 은 모든 글자가 `<Text>` 안에 있어야 해서 웹과 달리 이게 primitive 다.
 *
 * `lineHeight` 를 반드시 채우는 이유: RN 은 기본 line height 를 폰트 메트릭에서 가져와
 * 서체마다 다르게 준다. 토큰 배수를 `lineHeightFor` 로 절대값화해 박아야 같은 시안이
 * iOS·Android 에서 같은 높이로 선다.
 *
 * ## `textStyle` 과 낱개 축
 *
 * `textStyle` 은 크기·행간·자간을 **역할 하나로** 고른다. 웹 `primitives/Text` 와 같은 표
 * (`contract/text-style.ts`)를 읽으므로, 같은 이름을 준 글자는 두 레인에서 같은 비율로 선다.
 *
 * 낱개 축(`size`·`leading`)은 남아 있고 **`textStyle` 을 이긴다** — escape hatch 다.
 * 새 코드는 `textStyle` 로 쓰고, 낱개는 램프 밖 조합이 정말 필요할 때만 쓴다.
 *
 * `textStyle` 에 기본값을 주지 않은 이유: 지금 기본값(`base`·`normal`)과 `textStyle="body"`
 * (`base`·`relaxed`)의 행간이 다르다. 기본으로 깔면 이미 배포된 화면의 줄 간격이 조용히
 * 바뀐다. 축을 뒤집는 건 major 에서 한다.
 *
 * ⚠️ **`fontWeight` 는 가변 폰트가 등록돼 있을 때만 먹는다.** Pretendard 를 weight 별
 * 파일(`Pretendard-Bold` 등)로 등록한 앱에서는 `fontFamily` 를 그 이름으로 바꿔야 하고,
 * 이 축은 무시된다. 등록 방식은 앱의 결정이라 DS 는 토큰이 말하는 가변 폰트를 전제한다.
 */
export type { TextTone } from '../contract/text-style'

export interface TextProps extends RNTextProps {
  /** 램프의 역할 이름. 크기·행간·자간을 한 번에 정한다. 표는 `contract/text-style.ts`. */
  textStyle?: TextStyleName
  /** 크기 escape hatch. 주면 `textStyle` 의 크기를 덮는다. */
  size?: FontSizeKey
  weight?: FontWeightKey
  /** 행간 escape hatch. 주면 `textStyle` 의 행간을 덮는다. */
  leading?: LineHeightKey
  tone?: TextTone
  family?: keyof typeof nativeFontFamily
}

const Root = styled.Text<{
  $scheme: ColorScheme
  $size: FontSizeKey
  $weight: FontWeightKey
  $leading: LineHeightKey
  $track: LetterSpacingKey | undefined
  $tone: TextTone
  $family: keyof typeof nativeFontFamily
}>(({ $scheme, $size, $weight, $leading, $track, $tone, $family }) => ({
  color: $scheme[$tone],
  fontFamily: nativeFontFamily[$family],
  fontSize: nativeFontSize[$size],
  fontWeight: fontWeight[$weight],
  lineHeight: lineHeightFor($size, $leading),
  // `textStyle` 없이 쓰던 화면의 자간을 건드리지 않으려고, 램프를 고른 경우에만 박는다.
  ...($track ? { letterSpacing: letterSpacingFor($size, $track) } : null),
  // Android 가 폰트 위아래에 얹는 여백. 켜 두면 같은 시안이 iOS 보다 두껍게 선다.
  includeFontPadding: false,
}))

export function Text({
  textStyle,
  size,
  weight = 'regular',
  leading,
  tone = 'body',
  family = 'sans',
  ...rest
}: TextProps) {
  const scheme = useScheme()
  const spec = textStyle ? TEXT_STYLE_SPEC[textStyle] : undefined

  return (
    <Root
      $scheme={scheme}
      $size={size ?? spec?.fontSize ?? 'base'}
      $weight={weight}
      $leading={leading ?? spec?.lineHeight ?? 'normal'}
      $track={spec?.letterSpacing}
      $tone={tone}
      $family={family}
      {...rest}
    />
  )
}
