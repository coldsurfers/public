import { useCallback, useEffect, useRef } from 'react'

/**
 * 정체성은 고정이고 **몸통은 늘 최신인** 콜백.
 *
 * 매 렌더 새 함수가 오는 prop 을, 렌더 흐름 밖(타이머 · 구독 · 네이티브 스케줄러 콜백)에서
 * 불러야 할 때 쓴다. 그냥 붙들면 첫 렌더의 클로저를 계속 부르고, 의존성에 넣으면 그 구독이
 * 매 렌더 다시 걸린다. 둘 사이를 빠져나가는 자리다.
 *
 * ```ts
 * const notify = useEventCallback(onNotify)
 * useEffect(() => {
 *   const id = setInterval(() => notify(), 1000) // onNotify 가 바뀌어도 타이머는 안 다시 건다
 *   return () => clearInterval(id)
 * }, [notify])
 * ```
 *
 * ## React 의 `useEffectEvent` 와 무엇이 다른가
 *
 * React 19.2 에 같은 목적의 `useEffectEvent` 가 들어왔다. **먼저 그쪽을 본다** — 다만 문서가
 * "Effect 안에서만 부르고, 다른 컴포넌트나 훅에 넘기지 말라" 고 못박는다. 넘겨야 하는 자리
 * (스케줄러에 함수를 건네는 경우 등)와 peer 를 19.2 로 좁힐 수 없는 자리가 이쪽이다.
 *
 * ## 언제 안 맞는가
 *
 * ⚠️ **렌더 중에 부르면 안 된다.** 그 시점의 `ref` 는 아직 이전 렌더의 함수를 들고 있다.
 * React 의 `useEffectEvent` 는 이걸 예외로 잡아 주지만 여기는 조용히 옛 값을 부른다.
 *
 * ⚠️ **커밋과 effect 사이의 틈이 있다.** 갱신을 `useEffect` 로 하므로, 페인트 직후 effect 가
 * 흐르기 전에 이벤트가 들어오면 직전 렌더의 함수가 불린다. `useLayoutEffect` 면 그 틈이
 * 닫히지만 서버 렌더에서 경고가 난다 — 이 패키지는 서버에서도 물리므로 `useEffect` 를 남겼다.
 * 비동기 이어달리기(`await` 뒤)에서 부르는 용도라면 이 틈은 닿지 않는다.
 */
export function useEventCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
): (...args: Args) => Return {
  const ref = useRef(callback)

  // 렌더 중이 아니라 커밋 이후에 갱신한다 — 렌더 중에 쓰면 버려지는 렌더의 값이 남는다.
  useEffect(() => {
    ref.current = callback
  }, [callback])

  // 의존성이 비어 있어야 정체성이 고정된다. 그게 이 훅의 존재 이유다.
  return useCallback((...args: Args) => ref.current(...args), [])
}
