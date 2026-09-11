import styled from '@emotion/native'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  type AnimatedRef,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import {
  ACTIVATE_OFFSET_Y,
  FAIL_OFFSET_X,
  MAX_PULL,
  MIN_VISIBLE_MS,
  PULL_RESISTANCE,
  PULL_THRESHOLD,
  REFRESHING_GAP,
} from './PullToRefresh.constants'
import { PullToRefreshSpinner } from './PullToRefreshSpinner'

/**
 * 당겨서 새로고침 — **native 전용 표면**이다. 웹 짝이 없는 이유와 그래서 `contract/` 를 두지
 * 않는 근거는 `docs/native-lane-porting.md` 의 「웹에 짝이 생길 수 없는 표면」.
 *
 * RN 기본 `RefreshControl` 을 쓰지 않는 이유는 하나다. 그건 iOS `UIRefreshControl`·Android
 * `SwipeRefreshLayout` 이 그리는 **네이티브 뷰**라 자식도 커스텀 인디케이터도 받지 않는다.
 * 색 채널(`tintColor`/`colors`)만 열려 있어서, 색을 맞춰봐야 모양은 플랫폼 것 그대로다.
 * 그래서 당김 감지부터 이쪽이 한다.
 *
 * 스크롤러를 감싸지 않고 **children 함수로 돌려주는** 이유: 화면마다 스크롤러가 다르다
 * (피드는 `SectionList`, 목록 화면은 `FlatList`). 어느 쪽을 쓸지는 소비처가 정하고,
 * 여기서는 거기 꽂을 props 만 넘긴다.
 *
 * ⚠️ Android 는 오버스크롤 바운스가 없다 — 스크롤 오프셋이 음수로 내려가지 않으므로 "오프셋이
 * 마이너스면 당김"이라는 iOS 식 판정이 통째로 안 먹는다. 그래서 오프셋이 아니라 **제스처의 이동량**을
 * 재고, 오프셋은 "지금 맨 위인가"를 가르는 데만 쓴다.
 */

/**
 * 스크롤러 ref.
 *
 * 정확한 인스턴스 타입을 하나로 모을 수 없다 — `Animated.FlatList`·`SectionList` 가 각자
 * 자기 인스턴스 타입의 ref 를 요구하는데 그 둘이 서로 호환되지 않는다. 런타임에 필요한 건
 * "스크롤 오프셋을 읽을 수 있는 뷰" 하나뿐이라, 타입은 여기서 한 번 열고 소비처는 캐스팅 없이 꽂는다.
 */
// biome-ignore lint/suspicious/noExplicitAny: 스크롤러 구현체가 화면마다 달라 ref 타입이 하나로 안 모인다(위 주석)
export type PullToRefreshScrollableRef = AnimatedRef<any>

/**
 * 스크롤러에 그대로 펼쳐 넣어야 하는 props. `ref` 를 안 달면 "지금 맨 위인가"를 알 수 없어
 * 스크롤 중간에서도 당김이 걸린다 — 그래서 선택이 아니라 필수다.
 */
export interface PullToRefreshScrollableProps {
  ref: PullToRefreshScrollableRef
  /** iOS 네이티브 바운스를 끈다 — 켜두면 네이티브가 밀어 올린 만큼 이 틈에 더해져 두 배로 움직인다. */
  bounces: false
  /** Android 글로우/스트레치도 같은 이유로 끈다. */
  overScrollMode: 'never'
}

export interface PullToRefreshProps {
  /**
   * 스크롤러 ref — **소비처가 만들어 넘긴다**(`useAnimatedRef`). 여기서 만들어 children 인자로만
   * 주면 소비처가 scroll-to-top 같은 다른 용도와 합치려고 렌더마다 새 콜백 ref 를 쓰게 되고,
   * 그러면 React 가 매 렌더 `ref(null)` → `ref(node)` 를 돌려 당김 판정이 흔들린다.
   */
  scrollableRef: PullToRefreshScrollableRef
  /**
   * 새로고침 본체. **promise 를 돌려주면 그게 끝날 때까지** 인디케이터가 떠 있는다 —
   * 화면이 여러 쿼리로 쪼개져 있으면 `Promise.all` 로 묶어 넘기면 된다.
   */
  onRefresh: () => Promise<unknown> | undefined
  /** 스크롤러를 그리는 자리. 받은 props 를 그대로 펼쳐 넣어야 한다. */
  children: (scrollableProps: PullToRefreshScrollableProps) => ReactNode
  /** false 면 당김을 아예 받지 않는다(스크롤은 그대로). */
  enabled?: boolean
  /**
   * 인디케이터 스트립이 열리기 시작하는 y. 절대 위치 헤더가 콘텐츠 위에 떠 있는 화면에서
   * 0 에 열면 스트립이 헤더 뒤에 가려진다 — 헤더 높이를 넘기면 그 아래에서 열린다.
   */
  topInset?: number
}

const Root = styled.View({ flex: 1, overflow: 'hidden' })

/**
 * 열린 틈. 스크롤 **바깥**의 형제다 — 안에 두면 콘텐츠와 같이 흘러가 버린다.
 * 틈이 0 이어도 언마운트하지 않는다: 반복하면 회전이 매번 처음부터 다시 돈다.
 */
const Gap = styled(Animated.View)({
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
})

const Content = styled(Animated.View)({ flex: 1 })

export function PullToRefresh({
  scrollableRef,
  onRefresh,
  children,
  enabled = true,
  topInset = 0,
}: PullToRefreshProps) {
  /** 현재 스크롤 위치. "지금 맨 위인가"를 가르는 데만 쓴다(SectionList 도 내부는 ScrollView 라 같다). */
  const offset = useScrollOffset(scrollableRef)

  /** 지금 열려 있는 틈(px). 인디케이터 자리와 콘텐츠가 내려간 거리를 동시에 결정한다. */
  const pull = useSharedValue(0)

  /**
   * 손가락이 맨 위에 **닿은 순간**의 이동량. 스크롤을 한참 내렸다가 위로 쓸어 올려 top 에 닿는
   * 한 번의 제스처에서, 이미 쌓인 `translationY` 를 그대로 쓰면 손이 닿자마자 틈이 확 열린다.
   */
  const anchorY = useSharedValue(0)

  /** 새로고침이 도는 중인지. 도는 동안에는 당김을 다시 받지 않는다. */
  const isRefreshing = useSharedValue(false)

  /**
   * 제스처 콜백은 만들어질 때의 `onRefresh` 를 붙들고 있는다. 매 렌더 새 함수가 오는
   * 소비처에서 낡은 클로저를 부르지 않도록 ref 로 최신값을 본다. 갱신은 커밋 이후에 한다 —
   * 렌더 중에 쓰면 버려지는 렌더의 값이 남는다.
   */
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const runRefresh = useCallback(async () => {
    try {
      // 최소 노출을 **같이** 기다린다 — 순차로 기다리면 느린 응답에 450ms 가 그대로 얹힌다.
      await Promise.all([
        onRefreshRef.current(),
        new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_MS)),
      ])
    } catch {
      /**
       * 새로고침 실패는 네트워크가 죽으면 늘 나는 경로다. 여기서 삼키지 않으면
       * `scheduleOnRN(runRefresh)` 로 불린 promise 가 그대로 거부돼 unhandled rejection 이 된다.
       * 인디케이터는 아래 finally 가 닫고, 에러 표시는 소비처(각자의 error boundary)의 몫이다.
       */
    } finally {
      isRefreshing.value = false
      pull.value = withTiming(0, { duration: 220 })
    }
  }, [isRefreshing, pull])

  /**
   * 스크롤러의 네이티브 제스처를 RNGH 에 등록한다. 소비처의 스크롤러가 순수 RN `SectionList`·
   * `FlatList` 면 RNGH 핸들러가 없어서, 등록 없이는 Pan 이 스크롤 제스처에 항상 져 당김이 안 걸린다.
   */
  const nativeScroll = Gesture.Native()

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY(ACTIVATE_OFFSET_Y)
    .failOffsetX([-FAIL_OFFSET_X, FAIL_OFFSET_X])
    /**
     * 스크롤을 **취소시키지 않는다**. 이걸 빼면 당김이 활성화되는 순간 스크롤 제스처가 죽어서,
     * 맨 위에서 한 번 당긴 손가락으로는 다시 내려 스크롤할 수 없다.
     */
    .simultaneousWithExternalGesture(nativeScroll)
    .onBegin(() => {
      anchorY.value = 0
    })
    .onUpdate((event) => {
      if (isRefreshing.value) return

      // 아직 스크롤 안쪽이면 당김이 아니다. 기준점을 계속 밀어두면 맨 위에 닿는 순간 0 에서 시작한다.
      if (offset.value > 0.5) {
        anchorY.value = event.translationY
        pull.value = 0
        return
      }

      const distance = event.translationY - anchorY.value
      pull.value = distance <= 0 ? 0 : Math.min(distance * PULL_RESISTANCE, MAX_PULL)
    })
    // 취소로 끝나는 경우(가로 스와이프에 뺏김 등)까지 받아야 틈이 열린 채 남지 않는다.
    .onFinalize(() => {
      if (isRefreshing.value) return

      if (pull.value >= PULL_THRESHOLD) {
        isRefreshing.value = true
        pull.value = withTiming(REFRESHING_GAP, { duration: 180 })
        scheduleOnRN(runRefresh)
        return
      }

      pull.value = withTiming(0, { duration: 180 })
    })

  /** 높이가 곧 인디케이터 자리라, 다 안 열렸을 땐 인디케이터가 위에서부터 잘려 보인다. */
  const gapStyle = useAnimatedStyle(() => ({ height: pull.value, top: topInset }))

  /**
   * 당기는 동안 서서히 진해지고 커진다. 인디케이터는 무한 회전만 할 뿐 "얼마나 당겼는지"를
   * 그리지 못하므로, 그 진행을 불투명도와 크기가 대신 말해준다.
   */
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pull.value, [0, PULL_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(pull.value, [0, PULL_THRESHOLD], [0.6, 1], Extrapolation.CLAMP) },
    ],
  }))

  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.value }] }))

  return (
    <GestureDetector gesture={pan}>
      <Root>
        <Gap pointerEvents="none" style={gapStyle}>
          <Animated.View style={indicatorStyle}>
            <PullToRefreshSpinner />
          </Animated.View>
        </Gap>
        <Content style={contentStyle}>
          <GestureDetector gesture={nativeScroll}>
            {children({ ref: scrollableRef, bounces: false, overScrollMode: 'never' })}
          </GestureDetector>
        </Content>
      </Root>
    </GestureDetector>
  )
}
