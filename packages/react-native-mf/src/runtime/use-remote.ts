import { getRemote } from './registry'
import { scriptManager } from './script-manager'

/**
 * 정착한 실패를 들고 있는 자리. **`resetRemote` 전까지 안 비운다.**
 *
 * React 는 렌더에서 던져진 약속의 상태를 보지 않는다 — 거절돼도 다시 렌더할 뿐이다. 그래서
 * 매 렌더 새 약속을 던지면 실패가 무한 루프가 된다(실측: 20회에서 끊어야 멈췄고 ErrorBoundary
 * 는 한 번도 안 불렸다). 다음 렌더에 **에러를** 던져야 경계가 받는다.
 *
 * 던지면서 비우는 것도 안 된다. React 는 에러를 만나면 **트리를 한 번 처음부터 다시 그려보고**
 * 같은 에러가 또 나야 경계로 올린다 — 비워두면 그 두 번째 렌더가 새 로드를 시작해서 루프가
 * 그대로 이어진다(실측: renders 21 · fetches 5). react-query 가 에러를 캐시에 두고
 * `QueryErrorResetBoundary` 로만 지우는 것과 같은 이유다.
 */
const failures = new Map<string, unknown>()

/**
 * [1.5] Suspense 어댑터 — 로딩·에러 상태를 컴포넌트에서 없앤다.
 *
 * **React 를 import 하지 않는다.** 훅 API 를 하나도 부르지 않기 때문이다 — 하는 일은
 * "있으면 값, 없으면 약속을 던진다" 뿐이고, 그걸 받는 건 React 의 `Suspense` 경계다.
 * 그래서 이 패키지는 `react` 를 peer 로 물지 않는다.
 *
 * 몇 줄 안 되지만 그 줄들이 로더 내부에 기대고 있어서 여기 둔다:
 *
 *  - **동기 조회가 먼저다.** 먼저 던지면 이미 실행된 번들도 다시 받는다
 *  - **약속을 그대로 던진다.** `load` 가 in-flight 를 접으므로 렌더가 몇 번 돌아도 한 번만 받는다.
 *    `useState`/`useEffect` 로 감싸면 그 보장이 깨지고 번들이 두 번 실행된다(증상 1번)
 *  - **실패는 다음 렌더에 에러로 바뀌고 그대로 남는다.** 재시도는 `resetRemote` 가 연다
 *
 * ```tsx
 * const { default: MiniApp } = useRemote<{ default: FC<Props> }>('settings')
 * ```
 */
export function useRemote<T = unknown>(name: string): T {
  const loaded = getRemote<T>(name)
  if (loaded !== undefined) return loaded

  if (failures.has(name)) throw failures.get(name)

  throw scriptManager.load<T>(name).catch((error: unknown) => {
    failures.set(name, error)
    throw error
  })
}

/**
 * 기억된 실패를 지운다 — 다음 렌더가 처음부터 다시 받는다.
 *
 * ErrorBoundary 의 재시도 핸들러가 부르는 자리다. 안 부르면 경계를 리셋해도 같은 에러가
 * 즉시 되돌아온다.
 *
 * ```tsx
 * <ErrorBoundary onReset={() => resetRemote('settings')} FallbackComponent={...}>
 * ```
 */
export function resetRemote(name: string): void {
  failures.delete(name)
}
