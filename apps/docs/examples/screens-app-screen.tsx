'use client'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { TabBar, useTabBarHeight } from '@coldsurfers/design-system/native/TabBar'
import { Text } from '@coldsurfers/design-system/native/Text'
import { AppScreen, type AppScreenOffsetBottom } from '@coldsurfers/screens/AppScreen'
import { House, Search, Tickets, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Pressable, View } from 'react-native'

const TABS = [
  { key: 'feed', label: '피드', Icon: House },
  { key: 'events', label: '이벤트', Icon: Tickets },
  { key: 'search', label: '검색', Icon: Search },
  { key: 'my', label: '나의 창꼬', Icon: UserRound },
]

const OFFSETS: AppScreenOffsetBottom[] = ['tabBar', 'safeArea', 'none']

export default function Example() {
  const [offsetBottom, setOffsetBottom] = useState<AppScreenOffsetBottom>('tabBar')
  const scheme = useScheme()
  const tabBarHeight = useTabBarHeight()

  return (
    <View style={{ flex: 1 }}>
      <AppScreen offsetBottom={offsetBottom}>
        {/* 테두리가 곧 AppScreen 이 비운 자리의 경계다. */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: scheme.accent,
            backgroundColor: scheme.surface2,
            gap: 8,
            padding: 12,
          }}
        >
          <Text textStyle="labelSm" tone="muted">
            offsetBottom = {offsetBottom} · useTabBarHeight() = {tabBarHeight}
          </Text>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            {OFFSETS.map((candidate) => (
              <Pressable
                key={candidate}
                onPress={() => setOffsetBottom(candidate)}
                style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderColor: candidate === offsetBottom ? scheme.accent : scheme.border,
                  backgroundColor: candidate === offsetBottom ? scheme.surfaceActive : scheme.bg,
                }}
              >
                <Text textStyle="labelSm">{candidate}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Text textStyle="labelSm" tone="muted">
              콘텐츠 끝 — 이 선이 탭바에 닿으면 여백이 모자란 것이다
            </Text>
          </View>
        </View>
      </AppScreen>

      {/* 흐름 밖이라 자리를 안 비워 준다 — offsetBottom 이 있는 이유. */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <TabBar>
          {TABS.map(({ key, label, Icon }) => (
            <TabBar.Item
              key={key}
              label={label}
              active={key === 'feed'}
              renderIcon={({ color, size, strokeWidth }) => (
                <Icon color={color} size={size} strokeWidth={strokeWidth} aria-hidden />
              )}
            />
          ))}
        </TabBar>
      </View>
    </View>
  )
}
