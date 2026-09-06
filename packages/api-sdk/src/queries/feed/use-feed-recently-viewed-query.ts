import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'
import type { ApiClientType } from '../../types/api-client.types'

type FeedRecentlyViewedQueryParams = {
  anonymousUserId?: string
  placeholderData?: Awaited<ReturnType<ApiClientType['event']['getRecentEvents']>>
}

export const useFeedRecentlyViewedQuery = ({
  anonymousUserId,
  placeholderData,
}: FeedRecentlyViewedQueryParams) => {
  const { apiClient } = useApiClientContext()
  return useQuery(
    feedRecentlyViewedQueryOptions(apiClient, {
      anonymousUserId,
      placeholderData,
    }),
  )
}

export const feedRecentlyViewedQueryOptions = (
  apiClient: ApiClientType,
  params: FeedRecentlyViewedQueryParams,
) => {
  return {
    queryKey: apiClient.event.queryKeys.recent.anonymousUser(params),
    queryFn: () => apiClient.event.getRecentEvents(params),
    meta: {
      persist: true,
    },
    placeholderData: params.placeholderData,
  } satisfies UseQueryOptions
}
