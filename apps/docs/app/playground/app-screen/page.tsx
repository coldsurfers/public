'use client'

import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { TabBar, useTabBarHeight } from '@coldsurfers/design-system/native/TabBar'
import { Text } from '@coldsurfers/design-system/native/Text'
import {
  AppScreen,
  type AppScreenOffsetBottom,
  type AppScreenOffsetTop,
} from '@coldsurfers/screens/AppScreen'
import { House, Search, Tickets, UserRound } from 'lucide-react'
import { useState } from 'react'
import { View } from 'react-native'
import { PhoneFrame } from '../phone-frame'

/**
 * `@coldsurfers/screens` 의 `AppScreen` — 여백 축 두 개를 눈으로 보는 판.
 *
 * ## 무엇이 검증되고 무엇이 안 되나
 *
 * 검증되는 것은 **콘텐츠가 탭바 아래로 숨지 않는가** 하나다. 그게 이 컴포넌트가 존재하는
 * 이유이고, `offsetBottom` 을 `'none'` 으로 내리면 화면에서 바로 깨지는 게 보인다.
 *
 * 안 되는 것 셋:
 *
 * - **safe-area 여백.** 브라우저엔 안전 영역이 없어 인셋이 전부 0 이고
 *   (`shims/safe-area-context.tsx`), `useTabBarHeight()` 도 RNW 에서는
 *   `Platform.OS === 'web'` 이라 인셋을 안 탄다 — 여기 탭바는 늘 61 이다.
 *   **실기기에서는 홈 인디케이터만큼 더 크다.** 자로 재서 시안과 맞추면 안 된다
 * - **스피너 회전.** reanimated 가 대역이라 정지된 링으로 그려진다
 *   (`shims/react-native-reanimated.tsx`)
 * - **`ScrollView` 안에서의 거동.** 여기 콘텐츠는 고정 높이 한 덩어리다
 *
 * ## 왜 탭바를 `absolute` 로 얹나
 *
 * 원본 billets-app 이 그렇게 한다(`AnimatedTabBar`). 탭바가 레이아웃에서 빠져 자리를
 * 비워 주지 않으므로 **화면이 자기 아래 여백을 직접 잡아야 한다** — `offsetBottom` 이
 * 있는 이유가 정확히 이것이다. 탭바를 흐름 안에 넣으면 이 판이 증명할 게 없어진다.
 */

const TABS = [
  { key: 'home', label: '홈', Icon: House },
  { key: 'search', label: '검색', Icon: Search },
  { key: 'tickets', label: '티켓', Icon: Tickets },
  { key: 'profile', label: '프로필', Icon: UserRound },
] as const

const OFFSET_TOP: AppScreenOffsetTop[] = ['none', 'safeArea']
const OFFSET_BOTTOM: AppScreenOffsetBottom[] = ['none', 'safeArea', 'tabBar']

/** 절대 안 풀리는 프라미스 — 기본 `fallback`(DS `Spinner`)을 세워 두고 보기 위한 것. */
const NEVER: Promise<never> = new Promise(() => {})

function Suspending(): never {
  throw NEVER
}

/**
 * 여백을 눈에 보이게 하는 덩어리. 테두리가 곧 `AppScreen` 이 비운 자리의 경계다 —
 * 테두리 바깥의 바탕색이 여백이고, 아래 테두리가 탭바에 닿으면 `offsetBottom` 이 모자란 것이다.
 */
function Body() {
  const scheme = useScheme()

  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: scheme.accent,
        backgroundColor: scheme.surface2,
        justifyContent: 'space-between',
        padding: 12,
      }}
    >
      <Text textStyle="labelSm" weight="medium" style={{ color: scheme.muted }}>
        콘텐츠 시작
      </Text>
      <Text textStyle="labelSm" weight="medium" style={{ color: scheme.muted }}>
        콘텐츠 끝 — 이 선이 탭바에 닿으면 offsetBottom 이 모자란 것이다
      </Text>
    </View>
  )
}

export default function AppScreenPlayground() {
  const [offsetTop, setOffsetTop] = useState<AppScreenOffsetTop>('none')
  const [offsetBottom, setOffsetBottom] = useState<AppScreenOffsetBottom>('tabBar')
  const [suspended, setSuspended] = useState(false)
  const tabBarHeight = useTabBarHeight()

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="font-semibold text-2xl">AppScreen</h1>
      <p className="mt-2 text-fd-muted-foreground text-sm">
        <code>@coldsurfers/screens</code> 의 첫 멤버. 배경 · 위아래 여백 · Suspense 경계를 든다.
        탭바는 DS <code>native/TabBar</code> 를 <code>absolute</code> 로 얹은 것이라, 화면이 자기
        아래 여백을 직접 잡아야 한다.
      </p>

      <div className="mt-6 flex flex-wrap gap-6">
        <Control label="offsetTop" values={OFFSET_TOP} value={offsetTop} onChange={setOffsetTop} />
        <Control
          label="offsetBottom"
          values={OFFSET_BOTTOM}
          value={offsetBottom}
          onChange={setOffsetBottom}
        />
        <div>
          <span className="block font-medium text-sm">Suspense</span>
          <button
            type="button"
            onClick={() => setSuspended((v) => !v)}
            className={`mt-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              suspended
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border hover:bg-fd-accent'
            }`}
          >
            기본 fallback 보기
          </button>
        </div>
      </div>

      <p className="mt-4 text-fd-muted-foreground text-xs">
        지금 이 브라우저에서 <code>useTabBarHeight()</code> = <strong>{tabBarHeight}</strong>.
        인셋이 0 이라 <code>safeArea</code> 두 값도 0 으로 보이고, 스피너는 안 돈다 — 대역의 한계다.
        실기기에서는 탭바가 홈 인디케이터만큼 더 크다.
      </p>

      <PhoneFrame>
        <View style={{ flex: 1 }}>
          <AppScreen offsetTop={offsetTop} offsetBottom={offsetBottom}>
            {suspended ? <Suspending /> : <Body />}
          </AppScreen>

          {/* 흐름 밖이라 자리를 안 비워 준다 — `offsetBottom` 이 필요한 이유. */}
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            <TabBar>
              {TABS.map(({ key, label, Icon }, index) => (
                <TabBar.Item
                  key={key}
                  label={label}
                  active={index === 0}
                  renderIcon={({ color, size, strokeWidth }) => (
                    <Icon color={color} size={size} strokeWidth={strokeWidth} />
                  )}
                />
              ))}
            </TabBar>
          </View>
        </View>
      </PhoneFrame>
    </main>
  )
}

function Control<T extends string>({
  label,
  values,
  value,
  onChange,
}: {
  label: string
  values: T[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div>
      <span className="block font-medium text-sm">{label}</span>
      <div className="mt-2 flex gap-2">
        {values.map((candidate) => (
          <button
            key={candidate}
            type="button"
            onClick={() => onChange(candidate)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              candidate === value
                ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                : 'border-fd-border hover:bg-fd-accent'
            }`}
          >
            {candidate}
          </button>
        ))}
      </div>
    </div>
  )
}
