'use client'

import { Text } from '@coldsurfers/design-system/native'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import { House, Search, Tickets, UserRound } from 'lucide-react'
import { Pressable, View } from 'react-native'

/**
 * 4탭 바 — 원본 `ui/tab-bar/tab-bar.tsx` 의 리스킨.
 *
 * ## 원본과 무엇이 다른가 (전부 의도된 것)
 *
 * | | 원본 | 여기 |
 * | --- | --- | --- |
 * | 표면 | `foreground[1]` 다크 바 + 그림자 | `surface` + 상단 hairline |
 * | 라벨 | **없다** — 아이콘만 (`label` 블록이 주석 처리돼 있다) | 아이콘 + 라벨 |
 * | active | 아이콘 굵기만 (1.5 → 2.5) | 굵기 **+ accent 색** |
 *
 * 표면과 active 는 Figma 시안(`2467:1095`)에서 넘어온 것이라 리스킨의 범위 안이다.
 * **라벨은 아니다** — 원본에 없던 것을 더한 것이라 시각 언어가 아니라 내용 변경이다.
 * 굵기 1.5 ↔ 2.5 만으로는 지금 어느 탭인지가 화면에서 안 읽혀서 넣었고,
 * 그 판단이 맞는지는 **아직 안 정해졌다** — accent 만으로 충분하면 라벨은 빠져도 된다.
 * 문자열은 원본 `main-tab-navigation.tsx` 의 `tabBarLabel` 그대로다.
 *
 * ## 흡수 판정: 보류
 *
 * 밀어낼 수 있다(탭 목록 · 선택 · 아이콘 슬롯). 그런데 소비처가 이 시안 하나고,
 * 원본은 `@react-navigation/bottom-tabs` 의 `BottomTabBarProps` 를 받는 자리라
 * DS 로 올리면 **네비게이션 라이브러리를 계약에 끌고 들어오게 된다.** 그건 밀어내기가
 * 아니라 의존을 옮기는 것이다.
 *
 * ⚠️ 아이콘은 `lucide-react` 다 — 실제 RN 은 `lucide-react-native` 로 바꾼다.
 * 원본이 이미 그걸 쓰고 있고 이름·props 가 같아 import 한 줄이다.
 */

export interface TabItem {
  key: string
  label: string
  Icon: typeof House
}

/** 탭 순서 · 아이콘 · 라벨 전부 원본 `main-tab-navigation.tsx` 정본. */
export const TABS: TabItem[] = [
  { key: 'feed', label: '피드', Icon: House },
  { key: 'events', label: '이벤트', Icon: Tickets },
  { key: 'search', label: '검색', Icon: Search },
  { key: 'my', label: '나의 창꼬', Icon: UserRound },
]

/** 바 높이 — 스크롤 아래를 이만큼 비워야 마지막 카드가 안 가린다. */
export const TAB_BAR_HEIGHT = 96

export interface TabBarProps {
  tabs: TabItem[]
  selected: string
  onSelect: (key: string) => void
}

export function TabBar({ tabs, selected, onSelect }: TabBarProps) {
  const scheme = useScheme()

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: scheme.surface,
        borderTopWidth: 1,
        borderTopColor: scheme.border,
        paddingTop: nativeSpacing[2],
        // 홈 인디케이터가 앉을 자리 — 실제 앱에서는 `useSafeAreaInsets().bottom` 이다.
        paddingBottom: nativeSpacing[6],
      }}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = key === selected
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: nativeSpacing[1],
              paddingVertical: nativeSpacing[1],
            }}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.4 : 1.6}
              color={active ? scheme.accent : scheme.subtle}
              aria-hidden
            />
            <Text size="3xs" weight="medium" tone={active ? 'accent' : 'subtle'}>
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
