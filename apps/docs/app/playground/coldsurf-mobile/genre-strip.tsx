'use client'

import { Text } from '@coldsurfers/design-system/native'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { nativeSpacing, paper } from '@coldsurfers/design-system/tokens/native'
import { Pressable, ScrollView } from 'react-native'
import type { Genre } from './feed-data'

/**
 * 장르 스트립 — 원본 `GenreSelector`(모달)를 Figma 시안(`2467:1095`)의 **언더라인 탭**으로
 * 이식한 것. 고른 값이 화면에 남아 있는 게 모달보다 낫다는 게 시안의 판단이다.
 *
 * ## 흡수 판정: 보류
 *
 * 밀어낼 수는 있다 — 라벨 목록과 선택 상태만 받으면 되고 도메인이 안 들어온다. 그런데
 * **소비처가 이 시안 하나다.** 규칙은 "밀어낼 수 있으나 한 곳에서만 쓰인다 → 두 번째
 * 소비처가 생길 때" 이므로 여기 남는다. 원본 앱은 아직 모달을 쓰고, web-next 에는
 * 언더라인 탭이 없다.
 *
 * ⚠️ 그래서 이 파일은 `FeedSection` 과 **다른 성격**이다. 저건 옮길 모양 그대로 쓴 것이고,
 * 이건 옮길 계획이 없어서 시안 편의대로 써도 되는 자리다. 둘을 같은 디렉터리에 두되
 * 판정을 각자 머리말에 적어 두는 이유 — 안 적으면 다음 사람이 둘 다 후보로 읽는다.
 */
export interface GenreStripProps {
  genres: Genre[]
  selected: Genre
  onSelect: (genre: Genre) => void
}

export function GenreStrip({ genres, selected, onSelect }: GenreStripProps) {
  const scheme = useScheme()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        flexGrow: 0,
        backgroundColor: paper.warm,
        borderBottomWidth: 1,
        borderBottomColor: scheme.border,
      }}
      contentContainerStyle={{ gap: nativeSpacing[5], paddingHorizontal: nativeSpacing[4] }}
    >
      {genres.map((genre) => {
        const active = genre.name === selected.name
        return (
          <Pressable
            key={genre.uiName}
            onPress={() => onSelect(genre)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{
              paddingBottom: nativeSpacing[3],
              // 밑줄이 컨테이너 hairline 위에 얹히도록 1px 겹친다 — 안 겹치면 accent 바 아래에
              // 회색 선이 한 줄 더 생긴다.
              marginBottom: -1,
              borderBottomWidth: 2,
              borderBottomColor: active ? scheme.accent : 'transparent',
            }}
          >
            <Text
              size="sm"
              weight={active ? 'semibold' : 'regular'}
              tone={active ? 'strong' : 'subtle'}
            >
              {genre.uiName}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
