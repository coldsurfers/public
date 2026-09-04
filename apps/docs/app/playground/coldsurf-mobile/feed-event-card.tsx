'use client'

import { ConcertCard, Text } from '@coldsurfers/design-system/native'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { nativeRadius, nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import { Bookmark } from 'lucide-react'
import { Pressable, View } from 'react-native'
import type { FeedEvent } from './feed-data'

/**
 * 레일에 서는 카드 한 장 — 진짜 `ConcertCard` 에 담기 버튼과 레일 폭을 얹은 것.
 *
 * `FeedSection` 과 달리 **이건 DS 후보가 아니다.** 도메인(`FeedEvent`)을 알고, 담기라는
 * 앱 동작을 알고, 레일 폭이라는 소비처 치수를 안다 — 셋 다 밀어낼 수 없다. 흡수 판정으로는
 * *앱에 남는다* 쪽이고, 그래서 파일을 가른 값은 흡수가 아니라 **이식**이다:
 * billets-app 은 이 파일을 통째로 집어가 `ConcertListItem` 자리에 끼운다.
 *
 * ## 담기 버튼이 왜 손으로 그려져 있나
 *
 * 원본은 `ConcertSubscribeButton` 이고 DS 에는 `IconButton` 이 있는데, **둘이 안 맞는다.**
 * `IconButton` 의 축은 sm 36 · md 44 정사각(`borderRadius: md`)이고 여기 필요한 건
 * 커버 위에 얹히는 **30 원형**이다. 시안 치수를 맞추려고 variant 를 늘리면
 * "이 축이 이 컴포넌트의 것인가" 를 못 넘긴다(AGENTS.md 「흡수에는 상한이 있다」) —
 * 커버 오버레이는 버튼의 축이 아니라 **카드의 축**이라, 열려면 `coverAction` 쪽이지
 * `IconButton.size` 쪽이 아니다. 그 결정 전까지는 소비처가 그린다.
 */

/** 레일 카드 폭 — 원본 `ConcertListItem size="small"` 이 서는 폭(화면 폭의 0.4)에 맞춘 고정값. */
export const RAIL_CARD_WIDTH = 132

/** 담기 버튼 지름. 커버 우하단 여백(`coverActionInset` = 10)과 짝이라 카드 밖에서 못 정한다. */
const SAVE_BUTTON_SIZE = 30

export interface FeedEventCardProps {
  event: FeedEvent
  onToggleSave: (id: string) => void
}

export function FeedEventCard({ event, onToggleSave }: FeedEventCardProps) {
  const scheme = useScheme()

  return (
    <View style={{ width: RAIL_CARD_WIDTH }}>
      <ConcertCard
        tone={event.tone}
        initial={event.initial}
        title={event.title}
        meta={event.meta}
        // 공연장이 없으면 줄 자체를 안 넘긴다 — 빈 `Text` 를 넘기면 카드가 빈 줄을 잡는다.
        footer={
          event.venueName ? (
            <Text size="2xs" tone="muted" numberOfLines={1}>
              {event.venueName}
            </Text>
          ) : undefined
        }
        // 레일은 1줄 제목 기준이라 예약하지 않는다(`ConcertCard` 의 `reserveTitleLines` 주석).
        coverAction={
          <Pressable
            onPress={() => onToggleSave(event.id)}
            accessibilityRole="button"
            accessibilityLabel={event.saved ? '담기 취소' : '담기'}
            accessibilityState={{ selected: event.saved }}
            style={{
              width: SAVE_BUTTON_SIZE,
              height: SAVE_BUTTON_SIZE,
              borderRadius: SAVE_BUTTON_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              // 담긴 상태만 accent — 시안이 accent 를 쓰는 세 자리 중 하나다.
              // 안 담긴 쪽이 토큰이 아닌 이유: 커버 색면 위에서 읽히려면 스킴 색이 아니라
              // *커버를 어둡게 덮는 판*이 필요하다. 스킴에는 그 어휘가 없다.
              backgroundColor: event.saved ? scheme.accent : 'rgba(0, 0, 0, 0.45)',
            }}
          >
            <Bookmark size={13} color="#fff" fill={event.saved ? '#fff' : 'none'} aria-hidden />
          </Pressable>
        }
      />
    </View>
  )
}

/**
 * 카드 로딩 자리 — 커버 4:3 과 텍스트 3줄을 **실카드와 같은 치수**로 잡는다.
 * 커버 톤을 안 쓰고 border 색면으로 두는 이유: 톤은 id 에서 나오는데 로딩 중엔 id 가 없다.
 * 웹 스켈레톤은 소비처가 index 로 분산 주입하지만, 여기 레일은 두 장이라 값이 없다.
 */
export function FeedEventCardSkeleton() {
  const scheme = useScheme()
  const block = { backgroundColor: scheme.border, borderRadius: nativeRadius.sm }

  return (
    <View style={{ width: RAIL_CARD_WIDTH, gap: nativeSpacing[3] }} accessibilityElementsHidden>
      <View style={{ width: '100%', aspectRatio: 4 / 3, ...block, borderRadius: 8 }} />
      <View style={{ gap: 5 }}>
        <View style={{ ...block, width: '92%', height: 13 }} />
        <View style={{ ...block, width: '60%', height: 11 }} />
        <View style={{ ...block, width: '74%', height: 10 }} />
      </View>
    </View>
  )
}
