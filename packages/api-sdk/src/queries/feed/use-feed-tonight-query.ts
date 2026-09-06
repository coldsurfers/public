import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'
import type { ApiClientType } from '../../types/api-client.types'

type FeedTonightQueryParams = {
  locationCityName?: string
  size?: number
  placeholderData?: Awaited<ReturnType<ApiClientType['event']['getTonightEvents']>>
}

export const useFeedTonightQuery = ({
  locationCityName,
  size = 6,
  placeholderData,
}: FeedTonightQueryParams) => {
  const { apiClient } = useApiClientContext()
  return useQuery(
    feedTonightQueryOptions(apiClient, {
      locationCityName,
      size,
      placeholderData,
    }),
  )
}

export const feedTonightQueryOptions = (
  apiClient: ApiClientType,
  { locationCityName, size = 6, placeholderData }: FeedTonightQueryParams,
) => {
  return {
    queryKey: apiClient.event.queryKeys.tonightEvents.feed({
      locationCityName,
      size,
      cursor: undefined,
      direction: 'next',
    }),
    queryFn: () =>
      apiClient.event.getTonightEvents({
        size,
        locationCityName,
        cursor: undefined,
        direction: 'next',
      }),
    meta: {
      persist: true,
    },
    placeholderData,
  } satisfies UseQueryOptions
}
