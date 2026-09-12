'use client'
import { TabBar } from '@coldsurfers/design-system/native/TabBar'
import { Text } from '@coldsurfers/design-system/native/Text'
import { House, Search, Tickets, UserRound } from 'lucide-react'
import { useState } from 'react'
import { View } from 'react-native'

const TABS = [
  { key: 'feed', label: '피드', Icon: House },
  { key: 'events', label: '이벤트', Icon: Tickets },
  { key: 'search', label: '검색', Icon: Search },
  { key: 'my', label: '나의 창꼬', Icon: UserRound },
]

export default function Example() {
  const [selected, setSelected] = useState('feed')

  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text textStyle="body" tone="muted">
          {TABS.find((tab) => tab.key === selected)?.label}
        </Text>
      </View>

      <TabBar>
        {TABS.map(({ key, label, Icon }) => (
          <TabBar.Item
            key={key}
            label={label}
            active={key === selected}
            onPress={() => setSelected(key)}
            renderIcon={({ color, size, strokeWidth }) => (
              <Icon color={color} size={size} strokeWidth={strokeWidth} aria-hidden />
            )}
          />
        ))}
      </TabBar>
    </>
  )
}
