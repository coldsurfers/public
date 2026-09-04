'use client'

import { Text } from '@coldsurfers/design-system/native'
import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { nativeRadius, nativeSpacing } from '@coldsurfers/design-system/tokens/native'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

/**
 * 섹션 껍데기 — **제목 블록 + 가로 레일**. 카드는 `children` 으로 받는다.
 *
 * ## 이 파일이 따로 있는 이유
 *
 * 이건 시안의 조각이 아니라 **DS 로 올라갈 후보 1순위**다(AGENTS.md 「무엇을 여기로 옮기는가」).
 * 판정 근거는 규칙 그대로 둘이다:
 *
 * 1. **셋을 전부 밀어낼 수 있다.** 도메인 타입 · 라우터 · i18n 이 하나도 안 들어온다 —
 *    데이터는 `children` 으로, 이동은 `onPressMore` 로 나간다. 그래서 아래 import 가
 *    DS 와 `react-native` 뿐이다. 이 목록이 늘어나는 순간 흡수 판정이 뒤집힌다
 * 2. **두 번째 소비처가 이미 있다.** billets-app 의 `FeedHorizontalEvents.List` 와
 *    web-next 의 `TrendingRailLayout` 이 *같은 모양*이다 — 제목 · 부제 · 「모두 표시」 · 레일.
 *    한 곳이면 보류지만 둘이면 옮길 조건을 만족한다
 *
 * 그래서 이 파일은 **DS 에 들어갈 모양 그대로** 쓴다. 옮길 때가 오면 경로만 바뀌고
 * 본문은 그대로다 — 옮기면서 고쳐야 한다면 그건 아직 흡수할 준비가 안 된 것이다.
 *
 * ## 아직 안 옮긴 이유 (순서 규율)
 *
 * 웹 소비처(web-next)의 셸은 드래그 관성 · hover 페이저 · 페이드 마스크 · 키보드 스크롤을
 * 들고 있고(`components/HorizontalShelf.tsx`), 여기 레일은 `ScrollView` 한 줄이다.
 * **두 축이 같은 컴포넌트가 되려면 레일 자체가 플랫폼별 구현으로 갈려야** 하는데,
 * 그건 `ConcertCard` 가 이미 밟은 길(`contract/` + 구현 둘)이라 값은 알지만 순서가 있다 —
 * 웹부터다. 지금 native 만 먼저 열면 계약이 갈린다.
 *
 * ## 원본과 다른 것 하나
 *
 * 원본은 제목 블록 **전체**가 `Pressable` 이고 누르면 「더보기」로 간다. 「모두 표시」는
 * 그 안에 있는 라벨일 뿐 자기 히트박스가 없다. 여기도 같게 뒀다 — 접근성 상으로는
 * 라벨에 자기 버튼을 주는 게 맞지만, **그건 리스킨이 아니라 원본 수정**이라 시안이
 * 임의로 정할 자리가 아니다.
 */
export interface FeedSectionProps {
  title: string
  /** 제목 **위**에 오는 작은 줄. 원본 순서 그대로다. */
  subTitle?: string
  /** 있으면 제목 줄 오른쪽에 「모두 표시」가 뜬다. 원본 `FeedHorizontalEvents` 와 같은 규칙. */
  onPressMore?: () => void
  /** 레일에 서는 것들. 카드 폭은 카드가 정한다 — 껍데기는 폭을 모른다. */
  children: ReactNode
}

/** 「모두 표시」 — 원본 문자열이 정본이다(`feed-horizontal-events.tsx`). */
const MORE_LABEL = '모두 표시'

export function FeedSection({ title, subTitle, onPressMore, children }: FeedSectionProps) {
  return (
    <View style={{ paddingTop: nativeSpacing[6] }}>
      <Pressable
        onPress={onPressMore}
        // 원본과 같은 값. 라벨이 작아 손가락이 닿는 자리를 넓혀 준다.
        hitSlop={10}
        accessibilityRole={onPressMore ? 'button' : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: nativeSpacing[3],
          paddingHorizontal: nativeSpacing[4],
        }}
      >
        <View>
          {subTitle ? (
            <Text size="xs" tone="muted">
              {subTitle}
            </Text>
          ) : null}
          <Text size="lg" weight="semibold" tone="strong" style={{ marginTop: 2 }}>
            {title}
          </Text>
        </View>
        {onPressMore ? (
          <Text size="xs" tone="subtle">
            {MORE_LABEL}
          </Text>
        ) : null}
      </Pressable>

      {/* 원본은 horizontal FlatList. 목업은 항목이 한 화면 분량이라 `ScrollView` 로 둔다 —
          실 데이터(20건)로 갈 때 `FlatList` 로 바꾸는 건 앱의 결정이고, 이 껍데기는 안 바뀐다. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: nativeSpacing[3],
          paddingHorizontal: nativeSpacing[4],
          paddingTop: nativeSpacing[3],
        }}
      >
        {children}
      </ScrollView>
    </View>
  )
}

/**
 * 로딩 자리 — **실섹션과 같은 조판**이다. 제목 자리를 색면 두 개로 잡아 두므로 데이터가
 * 도착할 때 레일이 위아래로 안 밀린다. 카드 자리는 소비처가 채운다(껍데기는 카드를 모른다).
 *
 * ⚠️ 웹 스켈레톤(`cards/ConcertCardSkeleton`)에 있는 pulse 가 여기엔 없다. RN 에서
 * 그걸 내려면 `Animated` 루프를 컴포넌트마다 걸어야 하는데, **깜빡임 하나 때문에
 * 애니메이션 축을 여는 건 이 시안이 판정할 자리가 아니다.** 원본 스켈레톤도 정적이다.
 */
export function FeedSectionSkeleton({ children }: { children: ReactNode }) {
  const scheme = useScheme()
  const block = { backgroundColor: scheme.border, borderRadius: nativeRadius.sm }

  return (
    <View style={{ paddingTop: nativeSpacing[6] }} accessibilityElementsHidden>
      <View style={{ paddingHorizontal: nativeSpacing[4], gap: 6 }}>
        <View style={{ ...block, width: 96, height: 11 }} />
        <View style={{ ...block, width: 148, height: 17 }} />
      </View>
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: nativeSpacing[3],
          paddingHorizontal: nativeSpacing[4],
          paddingTop: nativeSpacing[3],
        }}
      >
        {children}
      </ScrollView>
    </View>
  )
}
