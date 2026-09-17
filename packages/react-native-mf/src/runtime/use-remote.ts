import { getRemote } from './registry'
import { scriptManager } from './script-manager'

/**
 * [1.5] Suspense 어댑터 — 로딩·에러 상태를 컴포넌트에서 없앤다.
 *
 * **React 를 import 하지 않는다.** 훅 API 를 하나도 부르지 않기 때문이다 — 하는 일은
 * "있으면 값, 없으면 약속을 던진다" 뿐이고, 그걸 받는 건 React 의 `Suspense` 경계다.
 * 그래서 이 패키지는 `react` 를 peer 로 물지 않는다.
 *
 * 네 줄이라 소비처마다 다시 쓰기 쉬운데, 그 네 줄이 로더 내부에 기대고 있어서 여기 둔다:
 *
 *  - **동기 조회가 먼저다.** 먼저 던지면 이미 실행된 번들도 다시 받는다
 *  - **약속을 그대로 던진다.** `load` 가 in-flight 를 접으므로 렌더가 몇 번 돌아도 한 번만 받는다.
 *    `useState`/`useEffect` 로 감싸면 그 보장이 깨지고 번들이 두 번 실행된다(증상 1번)
 *
 * ```tsx
 * const { default: MiniApp } = useRemote<{ default: FC<Props> }>('settings')
 * ```
 *
 * 던진 로드는 기억되지 않으므로 `ErrorBoundary` 의 재시도가 그대로 먹는다. 단 **이미 실행된
 * 번들의 교체**는 재시도로 안 된다 — `invalidate` 후 앱 재시작이다.
 */
export function useRemote<T = unknown>(name: string): T {
  const loaded = getRemote<T>(name)
  if (loaded !== undefined) return loaded

  throw scriptManager.load<T>(name)
}
