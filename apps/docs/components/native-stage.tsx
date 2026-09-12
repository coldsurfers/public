'use client'

import type { ReactNode } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

/**
 * native 미리보기가 앉는 자리 — **화면 사각형 하나**다.
 *
 * `playground/phone-frame.tsx` 와 일부러 다르다. 저쪽은 *화면 하나가 기기 안에서 어떻게
 * 사는가* 를 증명하는 자리라 status bar 와 home indicator 를 그리고 852px 를 통째로 쓴다.
 * 여기는 *표면 하나가 어떻게 생겼는가* 를 보여주는 자리다 — 문서 본문에 기기 크롬이 끼면
 * 읽는 사람이 봐야 할 것(그 컴포넌트)보다 상자가 커진다.
 *
 * 폭만 393 으로 맞춘다(iPhone 15 논리 해상도). 폭은 컴포넌트가 어떻게 접히는지를 바꾸므로
 * 표면의 성질이고, 높이는 아니다.
 *
 * ## `SafeAreaProvider` 가 왜 여기 있나
 *
 * `TabBar` 가 `useSafeAreaInsets()` 를 부르는데, 프로바이더가 없으면 그 훅이 던진다.
 * 브라우저에선 인셋이 전부 0 이라 값이 쓰이진 않지만 — `useTabBarHeight()` 는
 * `Platform.OS === 'web'` 에서 `default: 0` 을 타므로 — 배선 자체는 있어야 한다.
 *
 * ⚠️ 그래서 **문서에서 본 탭바 높이는 실기기 높이가 아니다.** 실기기에선 홈 인디케이터
 * 인셋만큼 더 크다. 그 얘기는 `content/docs/native/tab-bar.mdx` 가 한다.
 */

/** iPhone 15 논리 해상도의 폭. `playground/phone-frame.css` 와 같은 값을 본다. */
const SCREEN_WIDTH = 393

export function NativeStage({ children, height }: { children: ReactNode; height?: number }) {
  return (
    <SafeAreaProvider>
      <div
        className="ds-surface relative mx-auto flex w-full flex-col overflow-hidden rounded-xl border border-fd-border"
        style={{ maxWidth: SCREEN_WIDTH, height }}
      >
        {children}
      </div>
    </SafeAreaProvider>
  )
}
