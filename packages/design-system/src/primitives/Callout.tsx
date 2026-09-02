import type { HTMLAttributes, ReactNode } from 'react'
import { callout, calloutAction, calloutBody } from './Callout.css'
import { cx } from './cx'

/**
 * 본문 흐름에 끼는 인라인 알림 상자 — 「지난 버전을 보고 있습니다」·「로그인에 실패했습니다」.
 * 근거·결정 로그: coldsurfers/public#34
 *
 * `Toast` 와 갈리는 지점은 **수명**이다. 토스트는 1.6초 뒤 사라지는 액션 결과고, 이건 조건이
 * 유지되는 동안 지면에 서 있는 상태다. 둘을 한 축으로 묶지 않는다.
 *
 * ## `role` 을 붙여주지 않는다
 *
 * 같은 상자가 스크린리더에 읽혀야 할 때(`/auth` 소셜 콜백 실패)와 읽히면 방해일 때(`/legal`
 * 정적 안내)가 있는데, 그건 DS 가 알 수 없는 맥락이다. `...rest` 로 통과만 시킨다 — prop 으로
 * 열면 두 소비처 중 한 곳만 쓰는 축이 또 생긴다(#34 D-5 · #33 D-1 과 같은 논리).
 *
 * ```tsx
 * <Callout tone="danger" role="alert">로그인에 실패했습니다</Callout>
 * <Callout action={<Link to="/terms">현행 보기 →</Link>}>지난 버전입니다</Callout>
 * ```
 *
 * ## `margin` 을 소유하지 않는다
 *
 * 상자가 앞뒤 무엇과 서는지는 지면이 안다. 바깥 여백은 소비처가 준다 — `PageBanner` 와 같은
 * 규율이고, `Auth` 가 `cx(error, errorBanner)` 로 `margin` 을 두 클래스에 겹쳐 선언하던
 * (같은 레이어 · 소스 순서로만 갈리던) 위반이 이걸로 사라진다.
 *
 * 아이콘 슬롯·닫기 버튼은 없다 — 실사용 0곳. 두 번째 소비처가 생기면 그때 연다.
 */
export type CalloutTone = 'accent' | 'success' | 'warning' | 'danger'

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /** 기본 `accent`. status 3종은 글자까지 톤색이 되고 `accent` 만 중립 글자다(#34 D-4). */
  tone?: CalloutTone
  /** 오른쪽 끝 액션(링크·버튼). 폭이 모자라면 본문 아래로 접힌다. */
  action?: ReactNode
}

export function Callout({ tone = 'accent', action, className, children, ...rest }: CalloutProps) {
  return (
    <div className={cx(callout({ tone }), className)} {...rest}>
      <div className={calloutBody}>{children}</div>
      {action ? <div className={calloutAction}>{action}</div> : null}
    </div>
  )
}
