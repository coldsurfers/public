'use client'

import type { ComponentProps } from 'react'
import { View } from 'react-native'

/**
 * `react-native-reanimated` 의 **문서 사이트 전용 대역**. 배선은 `next.config.mjs` 의
 * `resolveAlias`.
 *
 * ## 왜 진짜 패키지가 못 서나
 *
 * 둘이다. (1) 모듈 최상단에서 `__DEV__` 를 읽는데 웹 번들엔 그걸 넣어 주는 자리가 없다
 * (RN 은 `setUpDeveloperTools.js` 에서 넣는다) — 없으면 프리렌더가
 * `ReferenceError: __DEV__ is not defined` 로 죽는다. `turbopack.define` 으로 넣어 봤지만
 * 프리렌더(Node) 패스엔 안 먹었다. (2) 워클릿은 babel 플러그인이 컴파일해야 도는데
 * 이 앱 번들엔 그 플러그인이 없다.
 *
 * ## 그래서 이걸로 검증되지 않는 것
 *
 * **움직임.** `useAnimatedStyle` 은 워클릿을 **한 번만** 평가해 초기 프레임을 돌려주고,
 * `withTiming`·`withRepeat` 은 목표값을 버린다. 그래서 `Spinner` 는 **안 도는 링**으로
 * 그려지고, `AnimatedTabBar` 의 숨김도 안 움직인다.
 *
 * 이 사이트가 판정하는 건 **치수·색·배치**다. 모션이 판정 대상인 시안이 생기면 그때는
 * 대역이 아니라 워클릿 플러그인을 켜야 한다 — 그 전까지 여기서 애니메이션을 흉내 내면
 * "되는 것처럼 보이는데 실제로는 다른" 판이 된다.
 *
 * ## 무엇을 안 넣었나
 *
 * 지금 이 사이트가 실제로 쓰는 건 DS `native/Spinner` 의 여섯(`Animated.View` · `Easing` ·
 * `useSharedValue` · `useAnimatedStyle` · `withRepeat` · `withTiming`)뿐이다. 쓰는 표면이
 * 생기면 그때 더한다 — 미리 채우면 어느 줄이 실제로 검증되는 배선인지 흐려진다.
 */

/** 초기 프레임만 그린다 — 위 「검증되지 않는 것」. */
const Animated = {
  View: (props: ComponentProps<typeof View>) => <View {...props} />,
}

export default Animated

export const Easing = {
  linear: (t: number) => t,
}

export function useSharedValue<T>(initial: T): { value: T } {
  return { value: initial }
}

export function useAnimatedStyle<T>(worklet: () => T): T {
  return worklet()
}

/**
 * 중간 프레임 없이 **끝값으로 바로 간다.** 시간축이 없으니 그게 유일하게 정직한 값이다 —
 * `undefined` 를 돌려주면 다음 렌더에서 `rotate: 'undefineddeg'` 같은 게 새어 나간다.
 */
export function withTiming<T>(toValue: T, _config?: unknown): T {
  return toValue
}

export function withRepeat<T>(animation: T, _numberOfReps?: number): T {
  return animation
}
