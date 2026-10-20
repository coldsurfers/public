import styled from '@emotion/native'
import { memo, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, type ImageLoadEvent, Pressable } from 'react-native'
import { PIN_CARD_SPEC as spec } from '../contract'
import { nativeShape } from '../tokens/native'
import { useScheme } from './scheme'
import { Text } from './Text'
import { useReducedMotion } from './useReducedMotion'

/**
 * 웹 `cards/PinCard` 를 RN 으로 옮긴 것. 치수는 `contract/pin-card.ts` 의 `PIN_CARD_SPEC`.
 *
 * | 웹 | 여기 | 왜 |
 * | --- | --- | --- |
 * | 제목 `children`(링크) | `title` 문자열 + `onPress` | RN 엔 링크가 덮는 자리가 없다 |
 * | hover 밝기 · `:active` 축소 | 누르는 동안 투명도 + 스프링 축소 | 손가락엔 hover 가 없다 |
 * | — | 포스터 페이드인 | 웹은 `onLoad` 상태가 필요해 `'use client'` 가 되므로 안 연다 |
 * | `className` | 없음 | 폭은 래핑 `View` 가 준다 |
 *
 * 모션은 RN 코어 `Animated` 로 낸다 — `Skeleton` 과 같은 판단(reanimated 를 peer 로 강제하지 않는다).
 */
export interface PinCardProps {
  /** 포스터 주소. 없으면 3:4 회색 자리에 `fallback`. */
  poster?: string | null
  title: string
  /** 출처 한 줄 — 도메인 · `@올린 사람`. */
  meta?: string | null
  /** 포스터가 없을 때 회색 자리 안 글자. 기본 `title`. */
  fallback?: string
  /** 포스터 오른쪽 아래 — 보통 담기 ＋. 안쪽 `Pressable` 이 터치를 먼저 받아 카드 누름과 갈린다. */
  action?: ReactNode
  /** 같은 함수를 넘기면 `memo` 가 리렌더를 끊는다. */
  onPress?: () => void
}

/** 한 번 받은 포스터의 가로 ÷ 세로 — 카드가 재활용 · 재마운트돼도 3:4 에서 덜컥 늘어나지 않게. */
const posterRatios = new Map<string, number>()

/** 포스터 비율 · 페이드. 재활용(같은 인스턴스에 다른 `poster`)이면 그 포스터 기준으로 다시 선다. */
function usePoster(poster: string | null | undefined, reduced: boolean) {
  const cached = poster ? posterRatios.get(poster) : undefined
  const opacity = useRef(new Animated.Value(cached ? 1 : 0)).current
  const [, setRatio] = useState(cached)
  useEffect(() => {
    opacity.setValue(poster && posterRatios.has(poster) ? 1 : 0)
  }, [poster, opacity])
  // 고정한다 — react-native-web 의 `Image` 는 `onLoad` 가 바뀌면 받던 걸 버리고 다시 받는다.
  const onLoad = useCallback(
    ({ nativeEvent }: ImageLoadEvent) => {
      const { width, height } = nativeEvent.source ?? {}
      if (!poster) return
      if (width && height) {
        posterRatios.set(poster, width / height)
        setRatio(width / height)
      }
      if (reduced) opacity.setValue(1)
      else
        Animated.timing(opacity, {
          toValue: 1,
          duration: spec.posterFadeMs,
          useNativeDriver: true,
        }).start()
    },
    [poster, reduced, opacity],
  )
  return { ratio: cached ?? spec.posterFallbackRatio, opacity, onLoad }
}

function usePressScale(reduced: boolean) {
  const scale = useRef(new Animated.Value(1)).current
  const to = (value: number) => () => {
    if (reduced) return
    Animated.spring(scale, {
      toValue: value,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start()
  }
  return { scale, onPressIn: to(spec.pressedScale), onPressOut: to(1) }
}

const PosterBox = styled.View({ position: 'relative' })

const Poster = styled.View<{ $bg: string }>(({ $bg }) => ({
  width: '100%',
  borderRadius: nativeShape.radiusPoster,
  overflow: 'hidden',
  backgroundColor: $bg,
}))

const Empty = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: spec.posterEmptyPadding,
})

const Action = styled.View({
  position: 'absolute',
  right: spec.actionInset,
  bottom: spec.actionInset,
})

const Caption = styled.View({
  marginTop: spec.captionGap,
  paddingHorizontal: spec.captionInset,
  gap: spec.metaGap,
})

export const PinCard = memo(function PinCard({
  poster,
  title,
  meta,
  fallback,
  action,
  onPress,
}: PinCardProps) {
  const scheme = useScheme()
  const reduced = useReducedMotion()
  const image = usePoster(poster, reduced)
  const press = usePressScale(reduced)

  return (
    <Pressable onPress={onPress} onPressIn={press.onPressIn} onPressOut={press.onPressOut}>
      {({ pressed }) => (
        <Animated.View style={{ transform: [{ scale: press.scale }] }}>
          <PosterBox style={{ opacity: pressed ? spec.pressedDim : 1 }}>
            <Poster
              $bg={scheme.bgAlt}
              style={{ aspectRatio: poster ? image.ratio : spec.posterFallbackRatio }}
            >
              {poster ? (
                <Animated.Image
                  source={{ uri: poster }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%', opacity: image.opacity }}
                  onLoad={image.onLoad}
                />
              ) : (
                <Empty>
                  <Text
                    size="sm"
                    weight="bold"
                    tone="text"
                    numberOfLines={5}
                    style={{ textAlign: 'center' }}
                  >
                    {fallback ?? title}
                  </Text>
                </Empty>
              )}
            </Poster>
            {action ? <Action>{action}</Action> : null}
          </PosterBox>
          <Caption>
            <Text
              weight="bold"
              tone="text"
              numberOfLines={spec.titleLines}
              style={{ fontSize: spec.titleFontSize, lineHeight: spec.titleLineHeight }}
            >
              {title}
            </Text>
            {meta ? (
              <Text
                tone="muted"
                numberOfLines={1}
                style={{ fontSize: spec.metaFontSize, lineHeight: spec.metaLineHeight }}
              >
                {meta}
              </Text>
            ) : null}
          </Caption>
        </Animated.View>
      )}
    </Pressable>
  )
})
