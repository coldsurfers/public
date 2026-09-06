import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import type { components } from '../../index'
import { useApiClientContext } from '../../react'

export const useInfiniteFeedListQuery = (
  cursor: components['schemas']['CursorPaginationQueryStringDTOSchema'],
  { definitionId }: { definitionId?: string },
) => {
  const { apiClient } = useApiClientContext()
  return useSuspenseInfiniteQuery({
    queryKey: apiClient.feed.queryKeys.list.byCursor(cursor, { definitionId }),
    queryFn: ({ pageParam = undefined }) =>
      apiClient.feed.fetchFeedList(
        {
          ...cursor,
          cursor: pageParam,
        },
        { definitionId },
      ),
    initialPageParam: cursor.cursor,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
  })
}
