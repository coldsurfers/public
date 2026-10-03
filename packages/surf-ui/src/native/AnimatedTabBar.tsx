import styled from '@emotion/native'
import { type ReactNode, useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { TabBar, useTabBarHeight } from './TabBar'

/**
 * 화면 하단에 고정되고 아래로 밀려 숨는 탭바 — **`TabBar` 를 움직이는 층**이다.
 *
 * `TabBar` 와 나눈 이유는 의존 하나다. reanimated 애니메이션 스타일은 `Animated.*` 에만 먹어서
 * 위치와 이동을 면이 같이 들면 면 자체가 reanimated 를 문다. 그러면 움직일 일이 없는 소비처도
 * 그 의존을 지므로, **움직이는 축만 여기로 뺐다**(coldsurfers/public#114 리뷰).
 *
 * 자리를 절대 위치로 잡는 것도 여기다 — 슬라이드하려면 레이아웃 흐름에서 빠져 있어야 하고,
 * 그건 *이동의 조건*이지 면의 성질이 아니다. 그래서 화면은 콘텐츠 아래 여백을 `useTabBarHeight()`
 * 로 직접 잡아야 한다(탭바가 자리를 비워 주지 않는다).
 *
 * 아이템은 그대로 `TabBar.Item` 을 쓴다.
 */

/** 숨김/복귀 전환. 스크롤에 따라 자주 도는 애니메이션이라 짧게 잡는다. */
const TOGGLE_DURATION_MS = 150

export interface AnimatedTabBarProps {
  /** false 면 아래로 밀어 숨긴다. 언마운트가 아니라 이동이라 되돌아올 때 상태가 남는다. */
  visible?: boolean
  /** `TabBar.Item` 들. */
  children: ReactNode
}

const Dock = styled(Animated.View)({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
})

export function AnimatedTabBar({ visible = true, children }: AnimatedTabBarProps) {
  const height = useTabBarHeight()
  const translateY = useSharedValue(0)

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, { duration: TOGGLE_DURATION_MS })
  }, [translateY, visible, height])

  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    return { transform: [{ translateY: translateY.value }] }
  })

  return (
    <Dock style={animatedStyle}>
      <TabBar>{children}</TabBar>
    </Dock>
  )
}
