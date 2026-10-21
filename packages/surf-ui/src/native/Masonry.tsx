import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list'
import type { ReactElement, ReactNode, Ref } from 'react'
import { View } from 'react-native'
import { MASONRY_SPEC as spec } from '../contract'

/**
 * 다단 그리드 — FlashList v2 `masonry`. 화면 밖 카드는 그리지 않고, 열은 실측 높이로 가장 낮은 쪽에 놓는다.
 * 웹 `cards/Masonry` 와 간격(`MASONRY_SPEC`)이 같다. 웹은 추정 높이(`heightOf`)로 놓지만 여기는 재서 놓으므로 그 prop 이 없다.
 *
 * **스크롤을 소유한다.** 위에 얹을 것은 `header`, 아래는 `footer`, 다음 쪽은 `onEndReached` 로 준다 —
 * 다른 `ScrollView` 안에 넣으면 가상화가 꺼진다. 바텀시트 안이면 `renderScrollComponent` 로 시트의 스크롤을 준다.
 *
 * 끝에 이어 붙는 목록만 다룬다. `maintainVisibleContentPosition` 은 끈다 — 켜 두면 먼 아래에서
 * `scrollToTop` 이 위 카드 높이 보정에 밀려 0 에 못 미친다.
 *
 * ⚠️ `@shopify/flash-list` ≥2 (New Architecture) 를 소비처가 들고 있어야 한다 — optional peer.
 */
export interface MasonryProps<T>
  extends Pick<
    FlashListProps<T>,
    | 'onEndReached'
    | 'onEndReachedThreshold'
    | 'refreshControl'
    | 'onScroll'
    | 'scrollEventThrottle'
    | 'contentContainerStyle'
    | 'ListEmptyComponent'
    | 'showsVerticalScrollIndicator'
    | 'keyboardShouldPersistTaps'
    | 'renderScrollComponent'
  > {
  items: readonly T[]
  /** 항목의 고유 키 — 재활용 · 배치의 열쇠. */
  keyOf: (item: T) => string
  renderItem: (item: T) => ReactElement | null
  /** 기본 2. */
  columnCount?: number
  /** 그리드 위 — 화면 머리 · 위 콘텐츠. */
  header?: ReactNode
  /** 그리드 아래 — 다음 쪽 스피너 · 「더 불러오기」. */
  footer?: ReactNode
  /** 그리드 좌우 여백. 기본 0. */
  paddingHorizontal?: number
  ref?: Ref<FlashListRef<T>>
}

/**
 * 열 간격은 셀 좌우 반쪽씩으로 낸다 — FlashList 는 열 폭을 똑같이 자르고 `gap` 을 모른다.
 * 바깥 반쪽은 컨테이너 음수 여백이 아니라 좌우 패딩을 반쪽만큼 줄여 상쇄한다.
 */
const half = spec.columnGap / 2

export function Masonry<T>({
  items,
  keyOf,
  renderItem,
  columnCount = spec.columnCount,
  header,
  footer,
  paddingHorizontal = 0,
  contentContainerStyle,
  ref,
  ...rest
}: MasonryProps<T>) {
  return (
    <FlashList
      ref={ref}
      masonry
      optimizeItemArrangement
      maintainVisibleContentPosition={{ disabled: true }}
      numColumns={columnCount}
      data={items}
      keyExtractor={keyOf}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: half, paddingBottom: spec.rowGap }}>
          {renderItem(item)}
        </View>
      )}
      ListHeaderComponent={
        header ? <View style={{ paddingHorizontal: half }}>{header}</View> : null
      }
      ListFooterComponent={
        footer ? <View style={{ paddingHorizontal: half }}>{footer}</View> : null
      }
      contentContainerStyle={{
        paddingHorizontal: Math.max(0, paddingHorizontal - half),
        ...(contentContainerStyle as object),
      }}
      {...rest}
    />
  )
}
