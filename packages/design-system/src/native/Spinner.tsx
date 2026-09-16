import styled from '@emotion/native'
import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { getSpinnerGeometry, SPINNER_SPEC } from '../contract'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 로딩 표시 — 웹 `primitives/Spinner` 와 **같은 prop 이름**(`size`·`label`)을 쓰고,
 * 같은 링을 그린다. light 트랙 링 + `accent` 270° 아크.
 *
 * 치수는 양쪽이 같은 표를 읽는다 — `contract/spinner.ts` 의 `SPINNER_SPEC`.
 *
 * 한때 이 자리는 `ActivityIndicator` 였다. 아크를 그리려면 `react-native-svg` 를 물어야 하는데
 * "로더 하나 때문에 소비자에게 네이티브 의존을 지우는 값은 안 낸다" 는 판단이었다. 그 판단이
 * 뒤집힌 근거는 둘이다 — (1) `PullToRefresh` 가 이미 svg 를 optional peer 로 열었고,
 * (2) 플랫폼 인디케이터로는 **`size` 가 iOS 에서 무시돼**(`UIActivityIndicatorView` 는 두 단계뿐)
 * 시안과 픽셀로 맞출 수가 없었다. 소비처가 자기 로더를 따로 드는 걸 막는 게 이 컴포넌트의 일이다.
 *
 * ⚠️ 이 표면은 `react-native-svg` · `react-native-reanimated` 를 **실제로 문다.** 둘 다
 * optional peer 라 native 레인을 쓰는 소비처는 이미 들고 있지만, 배럴이 아니라
 * `native/Spinner` 진입점으로 열면 안 쓰는 화면까지 끌고 오지 않는다.
 *
 * `'worklet'` 을 손으로 적는 이유는 `PullToRefresh` 와 같다 — 워클릿 플러그인이 호출부의
 * *로컬 식별자 이름*으로 대상을 고르는데, 라이브러리는 컴파일돼 나가므로 그 이름이 살아 있다는
 * 보장이 소비처의 번들 설정에 달린다.
 */
export interface SpinnerProps {
  /** 지름(px). 기본은 `SPINNER_SPEC.size` — 웹과 같은 값. */
  size?: number
  /**
   * 있으면 스피너 아래 muted 라벨을 렌더. 없으면 스피너만 — 다만 **접근성 이름은 남는다**
   * (`SPINNER_SPEC.fallbackLabel`). 웹과 같은 폴백이다.
   */
  label?: string
}

const Root = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  gap: SPINNER_SPEC.gap,
})

export function Spinner({ size = SPINNER_SPEC.size, label }: SpinnerProps) {
  const scheme = useScheme()
  const { radius, circumference, arc } = getSpinnerGeometry(size)
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SPINNER_SPEC.spinDurationMs, easing: Easing.linear }),
      -1,
    )
  }, [rotation])

  const spinStyle = useAnimatedStyle(() => {
    'worklet'
    return { transform: [{ rotate: `${rotation.value}deg` }] }
  })

  return (
    <Root accessibilityRole="progressbar" accessibilityLabel={label ?? SPINNER_SPEC.fallbackLabel}>
      {/* 웹은 SVG 노드에 CSS 키프레임을 걸지만 RN 은 SVG 를 못 돌려 감싼 뷰를 돌린다. */}
      <Animated.View style={[{ width: size, height: size }, spinStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.border}
            strokeWidth={SPINNER_SPEC.strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.accent}
            strokeWidth={SPINNER_SPEC.strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${arc} ${circumference - arc}`}
          />
        </Svg>
      </Animated.View>
      {label ? (
        <Text weight="medium" tone="muted" style={{ fontSize: SPINNER_SPEC.labelFontSize }}>
          {label}
        </Text>
      ) : null}
    </Root>
  )
}
