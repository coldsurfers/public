'use client'

import { useScheme } from '@coldsurfers/design-system/native/scheme'
import { paper } from '@coldsurfers/design-system/tokens/native'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import './phone-frame.css'

/**
 * 폰 프레임 — 시안을 **기기 안에** 넣어 두는 상자. `children` 이 화면이다.
 *
 * ## 왜 화면 밖에 있어야 하나
 *
 * status bar 와 home indicator 는 **화면이 아니라 기기**다. 실제 앱에서 이 자리는 OS 가 그리고
 * 앱은 안전 영역만 피해 간다. 그래서 시안이 RN 트리 안에서 이걸 그리면 앱으로 옮길 때
 * **지워야 할 코드가 화면 한가운데에 남는다** — 옮길 수 있다는 주장이 그만큼 약해진다.
 *
 * 여기로 빼면 경계가 파일 단위로 선다: 이 파일은 옮겨지지 않는 것, `children` 은 그대로
 * 옮겨지는 것. `page.tsx` 를 열었을 때 보이는 트리가 곧 앱에 붙일 트리다.
 *
 * ## 색이 왜 props 가 아닌가
 *
 * status bar 글자와 home indicator 는 화면의 표면 톤을 따라가야 읽힌다. 그런데 **지금
 * 시안 표면이 하나뿐이다** — native 스킴은 `light` 하나고(`useScheme`), 시안의 고정 표면은
 * `paper.warm` 이다. 축이 하나인데 prop 을 열면 값이 안 정해진 채 소비처마다 다르게 적히고,
 * 그때 프레임은 계약이 아니라 색 인자를 받는 함수가 된다.
 *
 * **다크 크롬이 필요한 시안이 생기면 그때 연다.** 그 시점엔 무엇이 기본값인지가 화면 둘에서
 * 정해지므로 지금 추측으로 정할 필요가 없다(AGENTS.md · NORMS 「요청하지 않은 유연성」).
 *
 * ## 안 하는 것
 *
 * 스크롤 · safe-area · 회전 · 기기 크기 축을 안 든다. 프레임이 화면 동작에 관여하기 시작하면
 * 시안이 브라우저에서만 되는 코드로 미끄러진다 — 판정이 무의미해지는 지점이 정확히 거기다.
 */

/** iOS 시안의 관용 시각. Apple 이 30년 넘게 기기 사진에 쓰는 값이라 임의 선택이 아니다. */
const STATUS_TIME = '9:41'

export function PhoneFrame({ children }: { children: ReactNode }) {
  const scheme = useScheme()

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
      <div className="pf-frame">
        {/* 색만 여기서 인라인으로 넣는다 — CSS 변수로 두면 문서 사이트 다크에서 어긋난다. */}
        <div className="pf-statusbar" style={{ background: paper.warm, color: scheme.strong }}>
          <span>{STATUS_TIME}</span>
          <span className="pf-statusbar-signals">
            <Signal size={16} aria-hidden />
            <Wifi size={16} aria-hidden />
            <BatteryFull size={22} aria-hidden />
          </span>
        </div>

        {/* 여기부터 아래가 앱이다 — 화면이 `absolute` 를 걸 때의 기준점이기도 하다(탭바 등). */}
        <div className="pf-screen">{children}</div>

        <div className="pf-home-indicator" style={{ background: scheme.strong }} />
      </div>
    </View>
  )
}
