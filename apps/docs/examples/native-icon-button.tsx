'use client'
import { IconButton } from '@coldsurfers/design-system/native/IconButton'
import { nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import { Bookmark, Heart, Share2, X } from 'lucide-react'
import { View } from 'react-native'

export default function Example() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: nativeSpacing[3],
        padding: nativeSpacing[5],
      }}
    >
      <IconButton label="닫기">
        <X size={20} />
      </IconButton>
      <IconButton label="공유" variant="outline">
        <Share2 size={20} />
      </IconButton>
      <IconButton label="담기" variant="accent">
        <Bookmark size={20} color="white" />
      </IconButton>
      <IconButton label="좋아요" variant="primary" size="sm">
        <Heart size={18} color="white" />
      </IconButton>
    </View>
  )
}
