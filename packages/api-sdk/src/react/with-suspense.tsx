import { type ComponentType, forwardRef, type JSX, Suspense } from 'react'

export function withSuspense<P, R>(
  Wrapped: ComponentType<P & React.RefAttributes<R>>,
  fallback: JSX.Element | null = null,
) {
  const WithSuspense = forwardRef<R, P>((props, ref) => {
    return (
      <Suspense fallback={fallback}>
        {/* forwardRef 가 props 를 PropsWithoutRef<P> 로 좁혀 P 와 어긋나는 제네릭 한계 — 캐스팅으로 복원 */}
        <Wrapped {...(props as P)} ref={ref} />
      </Suspense>
    )
  })

  WithSuspense.displayName = `withSuspense(${Wrapped.displayName ?? Wrapped.name ?? 'Component'})`

  return WithSuspense
}
