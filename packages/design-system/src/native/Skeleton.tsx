import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  type DimensionValue,
  Easing,
  type ViewProps,
} from 'react-native'
import { type SkeletonTone, SKELETON_SPEC as spec } from '../contract'
import { nativeRadius, paper, type RadiusKey, withAlpha } from '../tokens/native'
import { useScheme } from './scheme'

/**
 * 로딩 자리표시자 — 데이터가 오기 전 지면의 실루엣. 웹 `primitives/Skeleton` 과 같은 축
 * (`width`·`height`·`aspectRatio`·`radius`·`tone`)이고, 맥동·톤 값은 `contract/skeleton.ts`
 * 의 `SKELETON_SPEC` 이 정본이다.
 *
 * ## 웹과 무엇이 다른가
 *
 * **치수 축이 좁다.** 웹 `width` 는 임의 CSS 길이(`'5rem'`)를 받지만 RN 은 `DimensionValue`
 * (숫자 · `'80%'`)뿐이고, `aspectRatio` 는 웹이 문자열(`'3 / 4'`) RN 이 숫자다. 좁혀서 옮긴
 * 축이라 계약에 올리지 않았다 — 같은 표현이 아닌 것을 같다고 적으면 그게 거짓말이다.
 *
 * **`asChild`·`className` 이 없다.** RN 엔 갈 자리가 없다. 이미 치수를 가진 스타일과 합성하는
 * 자리는 `style` 이 맡는다.
 *
 * **맥동을 `Animated`(RN 코어)로 낸다.** `react-native-reanimated` 를 peer 로 물지 않는다 —
 * 자리표시자 하나를 위해 소비자에게 네이티브 의존을 지우는 값은 안 낸다(`Spinner` 와 같은 판단).
 *
 * 모션 감소 설정이면 맥동을 끄고 **한 톤 죽인 정지 상태**로 둔다. 이유는 `SKELETON_SPEC`.
 */
export type { SkeletonTone }

export interface SkeletonProps extends ViewProps {
  /** 숫자(px) 또는 `'80%'`. */
  width?: DimensionValue
  height?: DimensionValue
  /** 웹의 `'3 / 4'` 자리 — RN 은 숫자를 먹으므로 나눗셈 결과로 넘긴다. */
  aspectRatio?: number
  /** `nativeRadius` 키. 기본 `none` — 각진 바가 텍스트 줄의 기본 꼴이다. */
  radius?: RadiusKey
  /** 기본 `neutral`. 어두운 커버 위에 얹는 자리만 `onCover`. */
  tone?: SkeletonTone
}

/**
 * 맥동 불투명도. 모션 감소면 정지 상수를, 아니면 `Animated.Value` 를 준다.
 *
 * 루프를 두 구간으로 쪼개는 이유: 웹 keyframes 가 `0% 1 → 50% min → 100% 1` 이라 한 주기에
 * 왕복이 들어 있다. 같은 곡선(`easing`)을 양쪽 구간에 걸어야 웹과 같은 리듬이 난다.
 */
function usePulseOpacity(): Animated.Value | number {
  const opacity = useRef(new Animated.Value(1)).current
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let alive = true
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value)
    })
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => {
      alive = false
      sub.remove()
    }
  }, [])

  useEffect(() => {
    if (reduced) return
    const half = spec.pulse.durationMs / 2
    const [x1, y1, x2, y2] = spec.pulse.easing
    const easing = Easing.bezier(x1, y1, x2, y2)
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: spec.pulse.minOpacity,
          duration: half,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: half,
          easing,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [reduced, opacity])

  return reduced ? spec.pulse.reducedOpacity : opacity
}

export function Skeleton({
  width,
  height,
  aspectRatio,
  radius = spec.defaultRadius,
  tone = 'neutral',
  style,
  ...rest
}: SkeletonProps) {
  const scheme = useScheme()
  const opacity = usePulseOpacity()
  const backgroundColor =
    tone === 'onCover' ? withAlpha(paper.warm, spec.onCoverAlpha) : scheme.surfaceHover

  return (
    <Animated.View
      // 웹의 `aria-hidden` 자리 — 자리표시자는 스크린리더가 읽을 내용이 아니다.
      // iOS 는 앞쪽, Android 는 뒤쪽 prop 을 본다.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, aspectRatio, borderRadius: nativeRadius[radius], backgroundColor },
        style,
        { opacity },
      ]}
      {...rest}
    />
  )
}
