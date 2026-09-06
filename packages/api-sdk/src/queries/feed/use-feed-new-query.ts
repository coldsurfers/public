import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'
import type { ApiClientType } from '../../types/api-client.types'

type FeedNewQueryParams = {
  locationCityName?: string
  size?: number
  placeholderData?: Awaited<ReturnType<ApiClientType['event']['getNewEvents']>>
}

export const useFeedNewQuery = ({
  locationCityName,
  size = 6,
  placeholderData,
}: FeedNewQueryParams) => {
  const { apiClient } = useApiClientContext()
  return useQuery(
    feedNewQueryOptions(apiClient, {
      locationCityName,
      size,
      placeholderData,
    }),
  )
}

export const feedNewQueryOptions = (
  apiClient: ApiClientType,
  { locationCityName, size = 6, placeholderData }: FeedNewQueryParams,
) => {
  return {
    queryKey: apiClient.event.queryKeys.newEvents.feed({
      locationCityName,
      size,
      cursor: undefined,
      direction: 'next',
    }),
    queryFn: () =>
      apiClient.event.getNewEvents({
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
