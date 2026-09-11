import styled from '@emotion/native'
import type { ReactNode } from 'react'
import { Platform, StyleSheet, type TouchableOpacityProps, type ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ColorScheme } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'

/**
 * 하단 탭바의 **면** — native 전용 표면이다. 웹 짝이 없는 이유는
 * `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」.
 *
 * ## 무엇을 들고 무엇을 안 드는가
 *
 * 이건 면(chrome)이지 네비게이션도 배치도 아니다.
 *
 * | 여기 | 여기가 아닌 곳 |
 * | --- | --- |
 * | 색·테두리·높이(safe-area 포함)·아이템 배치·라벨 서식·활성 tint | 라우터 배선 · route → 아이콘 매핑 · 햅틱 → **소비처** |
 * | | 화면 하단 고정 · 숨김 애니메이션 → **`AnimatedTabBar`** |
 *
 * **위치를 정하지 않는 이유**는 reanimated 다. 애니메이션 스타일은 `Animated.*` 에만 먹으므로,
 * 위치와 이동을 한 컴포넌트가 들면 이 파일이 reanimated 를 물게 된다. 그러면 애니메이션을
 * 안 쓰는 소비처까지 그 의존을 진다 — 그래서 움직이는 축은 `AnimatedTabBar` 로 뺐다
 * (coldsurfers/public#114 리뷰). **여기 의존은 emotion + safe-area-context 둘뿐이다.**
 *
 * 아이콘을 노드가 아니라 **함수로 받는** 이유도 같은 경계다. 색·크기·굵기는 활성 여부에서
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

/** 라벨은 아이콘에 붙는 캡션이라 토큰 행간(1.6배)만큼 벌어지면 안 된다. */
const LABEL_LINE_HEIGHT = 13

/**
 * 탭바가 실제로 차지하는 높이 — 안쪽 높이 + 아래 여백.
 *
 * 화면이 자기 콘텐츠 아래 여백을 이 값으로 잡는다. `AnimatedTabBar` 로 띄우면 탭바가
 * 레이아웃에서 빠져 자리를 비워 주지 않기 때문이다.
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

export interface TabBarProps extends ViewProps {
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

const Bar = styled.View<{ $scheme: ColorScheme; $height: number; $bottomSpace: number }>(
  ({ $scheme, $height, $bottomSpace }) => ({
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

export function TabBar({ children, ...rest }: TabBarProps) {
  const scheme = useScheme()
  const height = useTabBarHeight()

  return (
    <Bar
      $scheme={scheme}
      $height={height}
      $bottomSpace={height - CONTENT_HEIGHT}
      accessibilityRole="tablist"
      {...rest}
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
