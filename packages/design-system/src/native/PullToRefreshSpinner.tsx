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
 * 아크 인디케이터 — `Spinner` 를 쓰지 않는 이유는 그쪽이 플랫폼 인디케이터라 이 아크를
 * 못 그리기 때문이다(`Spinner.tsx` 가 열어 둔 "그 표면이 자기 로더를 든다" 자리).
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

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

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
