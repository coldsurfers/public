import { useApiClientContext } from '../../react/api-client-provider'
import { createSuspenseCursorInfiniteQuery } from '../../react/create-suspense-cursor-infinite-query'
import type { ApiClientType } from '../../types/api-client.types'

type TPage = Awaited<ReturnType<ApiClientType['event']['getTonightEvents']>>
type TQueryKey = ReturnType<ApiClientType['event']['queryKeys']['tonightEvents']['feed']>

export const useInfiniteFeedTonightQuery = ({
  locationCityName,
  size = 6,
}: {
  locationCityName?: string
  size?: number
}) => {
  const { apiClient } = useApiClientContext()
  return createSuspenseCursorInfiniteQuery<TPage, TQueryKey>()({
    queryKey: apiClient.event.queryKeys.tonightEvents.feed({
      locationCityName,
      size,
      direction: 'next',
    }),
    queryFn: ({ pageParam }) =>
      apiClient.event.getTonightEvents({
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
