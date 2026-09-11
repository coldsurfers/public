import styled from '@emotion/native'
import { type ReactNode, useEffect } from 'react'
import { Platform, StyleSheet, type TouchableOpacityProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ColorScheme } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 하단 탭바 — **native 전용 표면**이다. 웹 짝이 없는 이유는
 * `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」.
 *
 * ## 무엇을 들고 무엇을 안 드는가
 *
 * 이건 **면(chrome)이지 네비게이션이 아니다.** 라우터·route 이름·아이콘 매핑·햅틱은 전부
 * 소비처에 남는다 — 그걸 들이면 DS 가 `@react-navigation` 과 앱의 route 유니온을 알아야 하고,
 * 그 순간 재활용이 아니라 이사가 된다.
 *
 * | 여기 | 소비처 |
 * | --- | --- |
 * | 높이·safe-area·테두리·색·숨김 애니메이션 | `navigation.emit` · `navigate` |
 * | 아이템 배치·라벨 서식·활성 tint | route → 아이콘 매핑 · 햅틱 |
 *
 * 아이콘을 노드가 아니라 **함수로 받는** 이유가 그 경계다. 색·크기·굵기는 활성 여부에서
 * 나오는 *이 면의 계약*이고, 무엇을 그릴지는 소비처의 것이다. 노드로 받으면 소비처가 tint 를
 * 알아야 하고, 그러면 색 계약이 밖으로 샌다.
 */

/** 탭바 **안쪽** 높이 — paddingTop 8 + (아이콘 24 + gap 4 + 라벨 13 + 세로 여백 12). */
const CONTENT_HEIGHT = 61

/** Android 는 홈 인디케이터가 없어 인셋이 0 이다. 손가락이 화면 끝에 닿지 않게 이만큼만 띄운다. */
const ANDROID_BOTTOM_SPACE = 12

const ICON_SIZE = 24
/** 활성일 때 굵게 — 채움 아이콘 세트를 따로 두지 않고 굵기로 상태를 말한다. */
const ICON_STROKE_WIDTH_ACTIVE = 2.5
const ICON_STROKE_WIDTH_INACTIVE = 1.5

/** 숨김/복귀 전환. 스크롤에 따라 자주 도는 애니메이션이라 짧게 잡는다. */
const TOGGLE_DURATION_MS = 150

/** 라벨은 아이콘에 붙는 캡션이라 토큰 행간(1.6배)만큼 벌어지면 안 된다. */
const LABEL_LINE_HEIGHT = 13

/**
 * 탭바가 실제로 차지하는 높이 — 안쪽 높이 + 아래 여백.
 *
 * 화면이 자기 콘텐츠 아래 여백을 이 값으로 잡는다. 탭바가 `position: absolute` 라
 * 레이아웃이 자리를 비워 주지 않기 때문이다.
 *
 * **인셋을 상수로 박지 않는다.** 홈 인디케이터 높이는 기기마다 다르고 0 인 기기(SE·iPad)도
 * 있어서, 박으면 그런 기기에서 탭바 아래가 빈 채로 남는다.
 */
export function useTabBarHeight() {
  const { bottom: bottomInset } = useSafeAreaInsets()
  return (
    CONTENT_HEIGHT +
    Platform.select({ ios: bottomInset, android: ANDROID_BOTTOM_SPACE, default: 0 })
  )
}

export interface TabBarProps {
  /** false 면 아래로 밀어 숨긴다. 언마운트가 아니라 이동이라 되돌아올 때 상태가 남는다. */
  visible?: boolean
  /** `TabBar.Item` 들. */
  children: ReactNode
}

export interface TabBarItemProps extends TouchableOpacityProps {
  label: string
  active?: boolean
  /**
   * 아이콘을 그리는 자리. 색·크기·굵기는 이 면이 정해 넘긴다 — 위 「무엇을 들고 무엇을 안 드는가」.
   */
  renderIcon: (state: { color: string; size: number; strokeWidth: number }) => ReactNode
}

const Bar = styled(Animated.View)<{ $scheme: ColorScheme; $height: number; $bottomSpace: number }>(
  ({ $scheme, $height, $bottomSpace }) => ({
    // 슬라이드 애니메이션을 주려면 레이아웃 흐름에서 빠져 있어야 한다.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    height: $height,
    paddingBottom: $bottomSpace,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: $scheme.surface,
    borderTopColor: $scheme.border,
  }),
)

const Item = styled.TouchableOpacity({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  paddingVertical: 6,
})

export function TabBar({ visible = true, children }: TabBarProps) {
  const scheme = useScheme()
  const height = useTabBarHeight()
  const translateY = useSharedValue(0)

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : height, { duration: TOGGLE_DURATION_MS })
  }, [translateY, visible, height])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Bar
      $scheme={scheme}
      $height={height}
      $bottomSpace={height - CONTENT_HEIGHT}
      style={animatedStyle}
      accessibilityRole="tablist"
    >
      {children}
    </Bar>
  )
}

function TabBarItem({ label, active = false, renderIcon, ...rest }: TabBarItemProps) {
  const scheme = useScheme()
  const tint = active ? scheme.accent : scheme.muted

  return (
    <Item accessibilityRole="tab" accessibilityState={{ selected: active }} {...rest}>
      {renderIcon({
        color: tint,
        size: ICON_SIZE,
        strokeWidth: active ? ICON_STROKE_WIDTH_ACTIVE : ICON_STROKE_WIDTH_INACTIVE,
      })}
      <Text
        textStyle="labelSm"
        weight="medium"
        style={{ lineHeight: LABEL_LINE_HEIGHT, color: tint }}
      >
        {label}
      </Text>
    </Item>
  )
}

TabBar.Item = TabBarItem
