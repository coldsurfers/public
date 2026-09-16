import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import {
  SPIN_DURATION_MS,
  SPINNER_ARC,
  SPINNER_CIRCUMFERENCE,
  SPINNER_RADIUS,
  SPINNER_SIZE,
  SPINNER_STROKE_WIDTH,
} from './PullToRefresh.constants'
import { useScheme } from './scheme'

/**
 * 아크 인디케이터.
 *
 * `Spinner` 를 쓰지 않는 이유가 한때는 "그쪽이 플랫폼 인디케이터라 이 아크를 못 그린다" 였는데
 * **그 근거는 뒤집혔다** — `Spinner.tsx` 도 지금은 같은 Svg + reanimated 아크다. 남는 이유는
 * 튜닝이다: 여기는 26 · 2.5 · 135° 로 당김 제스처에 붙어 서고, `Spinner` 는 30 · 3 · 270° 로
 * 혼자 선다. 공식은 `getSpinnerGeometry` 로 같이 쓴다(`PullToRefresh.constants.ts`).
 */
export function PullToRefreshSpinner() {
  const scheme = useScheme()
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SPIN_DURATION_MS, easing: Easing.linear }),
      -1,
    )
  }, [rotation])

  const spinStyle = useAnimatedStyle(() => {
    'worklet'
    return { transform: [{ rotate: `${rotation.value}deg` }] }
  })

  return (
    <Animated.View style={[{ width: SPINNER_SIZE, height: SPINNER_SIZE }, spinStyle]}>
      <Svg
        width={SPINNER_SIZE}
        height={SPINNER_SIZE}
        viewBox={`0 0 ${SPINNER_SIZE} ${SPINNER_SIZE}`}
      >
        <Circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={SPINNER_RADIUS}
          stroke={scheme.border}
          strokeWidth={SPINNER_STROKE_WIDTH}
          fill="none"
        />
        {/* 대시 시작점이 3시라 -90° 돌려 12시에서 시작한다. */}
        <Circle
          cx={SPINNER_SIZE / 2}
          cy={SPINNER_SIZE / 2}
          r={SPINNER_RADIUS}
          stroke={scheme.accent}
          strokeWidth={SPINNER_STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${SPINNER_ARC} ${SPINNER_CIRCUMFERENCE}`}
          transform={`rotate(-90 ${SPINNER_SIZE / 2} ${SPINNER_SIZE / 2})`}
        />
      </Svg>
    </Animated.View>
  )
}
