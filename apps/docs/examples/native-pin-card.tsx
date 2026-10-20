'use client'
import { PinCard } from '@coldsurfers/surf-ui/native/PinCard'
import { View } from 'react-native'
import { samplePins } from './pin-samples'

export default function Example() {
  const [first, second] = [samplePins[0], samplePins.at(-1)]
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 16, alignItems: 'flex-start' }}>
      {[first, second].map((pin) =>
        pin ? (
          <View key={pin.id} style={{ flex: 1 }}>
            <PinCard poster={pin.poster} title={pin.title} meta={pin.meta} />
          </View>
        ) : null,
      )}
    </View>
  )
}
