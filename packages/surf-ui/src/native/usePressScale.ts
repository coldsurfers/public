import { type ComponentProps, useRef } from 'react'
import {
  Animated,
  type GestureResponderEvent,
  type StyleProp,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native'
import { PRESS_SPEC, type PressSize } from '../contract'
import { useReducedMotion } from './useReducedMotion'

/**
 * `TouchableOpacity` 의 Animated 판 — 누름 축소의 `scale` 을 받을 자리. props 는 `TouchableOpacity` 그대로다.
 * 컴포넌트는 이걸 `styled(...)` 로 감싸 Root 로 쓴다.
 */
// 타입은 원본으로 좁힌다 — 추론된 Animated 타입은 RN 내부 경로를 물어 d.ts 로 못 내보낸다(TS2742).
export const AnimatedTouchable: typeof TouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity)

interface PressHandlers {
  onPressIn?: ((event: GestureResponderEvent) => void) | null
  onPressOut?: ((event: GestureResponderEvent) => void) | null
  /** `TouchableOpacity` 의 style 그대로 — Animated 값이 섞일 수 있다. */
  style?: ComponentProps<typeof TouchableOpacity>['style']
}

/**
 * 누르는 동안 살짝 줄어든다 — 웹 `pressable` 과 같은 `PRESS_SPEC`. 동작 줄이기 설정이면 안 줄어든다.
 * 소비처가 준 `onPressIn` · `onPressOut` · `style` 을 받아 합친 것을 돌려준다 — 그대로 펼쳐 넘긴다.
 * @remarks 소비처 `style` 의 `transform` 은 이 축소에 덮인다.
 * @example
 * const press = usePressScale('small', { onPressIn, onPressOut, style })
 * <AnimatedTouchable {...rest} {...press} />
 */
export function usePressScale(size: PressSize, { onPressIn, onPressOut, style }: PressHandlers) {
  const reduced = useReducedMotion()
  const scale = useRef(new Animated.Value(1)).current
  const to = (value: number) => {
    if (reduced) return
    Animated.spring(scale, {
      toValue: value,
      speed: PRESS_SPEC.springSpeed,
      bounciness: 0,
      useNativeDriver: true,
    }).start()
  }
  return {
    onPressIn: (event: GestureResponderEvent) => {
      to(PRESS_SPEC.scale[size])
      onPressIn?.(event)
    },
    onPressOut: (event: GestureResponderEvent) => {
      to(1)
      onPressOut?.(event)
    },
    // emotion `styled(AnimatedTouchable)` 이 Animated style 타입을 잃는다. 받는 쪽은 Animated 컴포넌트라 런타임은 맞다.
    style: [style, { transform: [{ scale }] }] as StyleProp<ViewStyle>,
  }
}
