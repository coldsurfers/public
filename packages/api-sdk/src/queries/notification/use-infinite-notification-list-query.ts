import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'

type Params = {
  direction: 'next' | 'prev'
  size?: number
  unread?: 'true' | 'false'
}

export const useInfiniteNotificationListQuery = (params: Params) => {
  const { apiClient } = useApiClientContext()
  return useSuspenseInfiniteQuery({
    queryKey: apiClient.notification.queryKeys.list({
      cursor: undefined,
      direction: params.direction,
      size: params.size,
      unread: params.unread,
    }),
    queryFn: ({ pageParam }) =>
      apiClient.notification.getList({
        cursor: pageParam,
        direction: params.direction,
        size: params.size,
        unread: params.unread,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
