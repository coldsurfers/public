'use client'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { Text } from '@coldsurfers/design-system/native/Text'
import { TextInput } from '@coldsurfers/design-system/native/TextInput'
import { nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import { useState } from 'react'
import { View } from 'react-native'

export default function Example() {
  const scheme = useScheme()
  const [email, setEmail] = useState('')
  const invalid = email.length > 0 && !email.includes('@')

  return (
    <View style={{ gap: nativeSpacing[2], padding: nativeSpacing[5] }}>
      <Text textStyle="labelSm" tone="muted">
        이메일
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        invalid={invalid}
        placeholder="you@coldsurf.io"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {/* 에러 문구는 `Text` 의 톤 축에 없다 — 스킴에서 직접 읽는다. */}
      {invalid ? (
        <Text textStyle="labelSm" style={{ color: scheme.statusDanger }}>
          @ 가 없습니다.
        </Text>
      ) : null}
    </View>
  )
}
