'use client'

import type { ReactNode } from 'react'

/**
 * `react-native-safe-area-context` 의 **문서 사이트 전용 대역**. 배선은
 * `next.config.mjs` 의 `resolveAlias` 가 건다 — 왜 진짜 패키지가 못 서는지도 거기 적혀 있다.
 *
 * ## 이게 미리보기의 정직함을 해치지 않는 이유
 *
 * 브라우저에는 안전 영역이 없다. 진짜 웹 판도 결국 0 을 준다 — DOM 을 재서 `env(safe-area-*)`
 * 를 읽는데 그 값이 데스크톱에서 전부 0 이다. 그래서 **여기서 0 을 주는 것과 결과가 같다.**
 *
 * 게다가 `useTabBarHeight()` 는 `Platform.select` 로 갈리는데 RNW 에서는
 * `Platform.OS === 'web'` 이라 `default: 0` 을 탄다 — 인셋 값이 애초에 쓰이지도 않는다.
 * 그래서 이 대역이 바꾸는 건 "훅이 던지느냐" 하나뿐이다.
 *
 * ## 그래서 이걸로 검증되지 않는 것
 *
 * **실기기 높이.** 탭바는 실기기에서 홈 인디케이터 인셋만큼 더 크다. 문서의 탭바 미리보기를
 * 자로 재서 시안과 맞추면 안 된다 — 그 얘기는 `content/docs/native/tab-bar.mdx` 가 한다.
 *
 * ## 무엇을 안 넣었나
 *
 * `SafeAreaView` · `useSafeAreaFrame` · `initialWindowMetrics` 는 이 사이트에서 아무도 안 쓴다.
 * 쓰는 표면이 생기면 그때 더한다 — 미리 채우면 어느 줄이 실제로 검증되는 배선인지 흐려진다.
 */

/** 브라우저에는 안전 영역이 없다. 훅 모양만 맞춘다. */
const ZERO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 } as const

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function useSafeAreaInsets() {
  return ZERO_INSETS
}
