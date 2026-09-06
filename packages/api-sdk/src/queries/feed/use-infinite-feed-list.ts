import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import type { WithInfiniteData } from '../../react/query.types'

type UseInfiniteFeedListParams<TPage, TItem> = {
  queryResult: {
    data: WithInfiniteData<TPage> | undefined
    isFetchingNextPage: boolean
    isLoading: boolean
    isPending: boolean
    hasNextPage: boolean
    fetchNextPage: () => Promise<unknown>
  }
  selectItems: (page: TPage) => TItem[]
  invalidateQueryKey: readonly unknown[]
}

export function useInfiniteFeedList<TPage, TItem>({
  queryResult,
  selectItems,
  invalidateQueryKey,
}: UseInfiniteFeedListParams<TPage, TItem>) {
  const { data, isFetchingNextPage, isLoading, isPending, hasNextPage, fetchNextPage } = queryResult

  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const items = useMemo(() => data?.pages.flatMap(selectItems) ?? [], [data?.pages, selectItems])

  const onEndReached = useCallback(async () => {
    if (isFetchingNextPage || isLoading || isPending || !hasNextPage) {
      return
    }
    await fetchNextPage()
  }, [isFetchingNextPage, isLoading, isPending, hasNextPage, fetchNextPage])

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await queryClient.resetQueries({ queryKey: invalidateQueryKey })
    setIsRefreshing(false)
  }, [isRefreshing, queryClient, invalidateQueryKey])

  return useMemo(
    () => ({
      data: items,
      isLoading: isFetchingNextPage,
      isRefreshing,
      onEndReached,
      onRefresh,
    }),
    [items, isFetchingNextPage, isRefreshing, onEndReached, onRefresh],
  )
}
