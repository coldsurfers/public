import { useApiClientContext } from '../../react/api-client-provider'
import { createSuspenseCursorInfiniteQuery } from '../../react/create-suspense-cursor-infinite-query'
import type { ApiClientType } from '../../types/api-client.types'

type TPage = Awaited<ReturnType<ApiClientType['event']['getNewEvents']>>
type TQueryKey = ReturnType<ApiClientType['event']['queryKeys']['newEvents']['feed']>

export const useInfiniteFeedNewQuery = ({
  locationCityName,
  size = 6,
}: {
  locationCityName?: string
  size?: number
}) => {
  const { apiClient } = useApiClientContext()
  return createSuspenseCursorInfiniteQuery<TPage, TQueryKey>()({
    queryKey: apiClient.event.queryKeys.newEvents.feed({
      locationCityName,
      size,
      direction: 'next',
    }),
    queryFn: ({ pageParam }) =>
      apiClient.event.getNewEvents({
        size,
        locationCityName,
        direction: 'next',
        cursor: pageParam as string,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined
    },
    initialPageParam: undefined,
  })
}
