import { Spinner } from '@coldsurfers/design-system/native/Spinner'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { useTabBarHeight } from '@coldsurfers/design-system/native/TabBar'
import styled from '@emotion/native'
import { type ReactNode, Suspense } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type AppScreenOffsetTop = 'none' | 'safeArea'
export type AppScreenOffsetBottom = 'none' | 'safeArea' | 'tabBar'

export interface AppScreenProps {
  children: ReactNode
  /** 상단 여백. 기본 `'none'` — 헤더는 react-navigation 소관이라 화면 밖이다. */
  offsetTop?: AppScreenOffsetTop
  /** 하단 여백. 기본 `'tabBar'`. */
  offsetBottom?: AppScreenOffsetBottom
  /** Suspense 폴백. 기본은 정중앙 DS `Spinner`. */
  fallback?: ReactNode
  style?: StyleProp<ViewStyle>
}

const Root = styled.View<{ $bg: string; $top: number; $bottom: number }>(
  ({ $bg, $top, $bottom }) => ({
    flex: 1,
    backgroundColor: $bg,
    paddingTop: $top,
    paddingBottom: $bottom,
  }),
)

/** 폴백은 흐름에서 빼 정중앙에 세운다 — 콘텐츠가 자리를 잡기 전이라 기댈 높이가 없다. */
const FallbackSlot = styled.View({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: 'center',
  justifyContent: 'center',
})

/**
 * 화면 한 장의 **바닥 판** — 배경 · 위아래 여백 · 로딩 경계.
 *
 * ## 무엇을 들고 무엇을 안 드는가
 *
 * | 여기 | 여기가 아닌 곳 |
 * | --- | --- |
 * | 배경색 · safe-area 여백 · 탭바 여백 · Suspense 경계 | 헤더 → react-navigation `options.header` |
 * | | 에러 경계 → **소비처.** react-query 의존이라 여기서 못 든다 |
 * | | 탭바 자체 → DS `native/TabBar` |
 *
 * **에러 경계를 안 드는 이유**는 의존이다. `QueryErrorBoundary` 를 넣으면 이 패키지가
 * react-query 를 물게 되고, 그러면 데이터를 안 읽는 화면까지 그 의존을 진다. 소비처가
 * 바깥에서 감싼다.
 *
 * ## 여백을 두 축으로 가른 이유
 *
 * 앞판(`CommonScreenLayout`)은 `edges: Edges` 와 `withBottomTab: boolean` 을 따로 받았는데
 * **둘 다 하단을 건드렸다.** 조합 넷이 만드는 값이 이랬다:
 *
 * ```
 * edges=[],         withBottomTab=true   → tabBarHeight - bottomInset
 * edges=['bottom'], withBottomTab=true   → tabBarHeight
 * edges=['bottom'], withBottomTab=false  → bottomInset
 * edges=[],         withBottomTab=false  → 0
 * ```
 *
 * `tabBarHeight - bottomInset` 은 앞판이 탭바 높이를 **상수로 박아서**(`iOS 85`/`Android 63`)
 * 생긴 보정식이다. DS `useTabBarHeight()` 는 인셋을 포함해 계산하므로 보정이 필요 없고,
 * 넷이 `offsetBottom` 세 값으로 접힌다.
 *
 * `left`·`right` 는 받지 않는다 — 앞판 호출부 22곳에서 **한 번도 안 썼다.** 있는데 안 먹는
 * prop 보다 없는 게 낫고, 필요해지면 그때 연다.
 *
 * ⚠️ 기본 `fallback` 이 DS `Spinner` 라 `react-native-svg` · `react-native-reanimated` 를
 * 전이로 문다. native 레인 소비처는 이미 들고 있지만, 안 쓰고 싶으면 `fallback` 을 넘긴다.
 */
export function AppScreen({
  children,
  offsetTop = 'none',
  offsetBottom = 'tabBar',
  fallback,
  style,
}: AppScreenProps) {
  const scheme = useScheme()
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets()
  const tabBarHeight = useTabBarHeight()

  const bottom =
    offsetBottom === 'tabBar' ? tabBarHeight : offsetBottom === 'safeArea' ? bottomInset : 0

  return (
    <Root
      $bg={scheme.bg}
      $top={offsetTop === 'safeArea' ? topInset : 0}
      $bottom={bottom}
      style={style}
    >
      <Suspense
        fallback={
          fallback ?? (
            <FallbackSlot>
              <Spinner />
            </FallbackSlot>
          )
        }
      >
        {children}
      </Suspense>
    </Root>
  )
}
