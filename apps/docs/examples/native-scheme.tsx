'use client'
import { useScheme } from '@coldsurfers/surf-ui/native/scheme'
import { Text } from '@coldsurfers/surf-ui/native/Text'
import { nativeRadius, nativeSpacing } from '@coldsurfers/surf-ui/tokens/native'
import { View } from 'react-native'

/** 색을 훅에서 받아 스타일에 직접 넣는다 — RN 엔 CSS 변수가 없다. */
const SLOTS = ['bg', 'surface', 'border', 'text', 'muted', 'accent'] as const

export default function Example() {
  const scheme = useScheme()

  return (
    <View style={{ gap: nativeSpacing[2], padding: nativeSpacing[5] }}>
      {SLOTS.map((slot) => (
        <View
          key={slot}
          style={{ flexDirection: 'row', alignItems: 'center', gap: nativeSpacing[3] }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: nativeRadius.sm,
              borderWidth: 1,
              borderColor: scheme.border,
              backgroundColor: scheme[slot],
            }}
          />
          <Text textStyle="bodySm">{slot}</Text>
          <Text textStyle="labelSm" tone="subtle">
            {scheme[slot]}
          </Text>
        </View>
      ))}
    </View>
  )
}
