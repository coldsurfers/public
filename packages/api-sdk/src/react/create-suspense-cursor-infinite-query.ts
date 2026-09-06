import {
  type UseSuspenseInfiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query'
import type { OpenApiError } from '../index'
import type { WithInfiniteData } from './query.types'

type NextCursorPageParam = string | number | undefined

export function createSuspenseCursorInfiniteQuery<
  TPage,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>() {
  return (
    options: UseSuspenseInfiniteQueryOptions<
      TPage,
      OpenApiError,
      WithInfiniteData<TPage>,
      TPage,
      TQueryKey,
      NextCursorPageParam
    >,
  ) =>
    useSuspenseInfiniteQuery<
      TPage,
      OpenApiError,
      WithInfiniteData<TPage>,
      TQueryKey,
      NextCursorPageParam
    >(options)
}
