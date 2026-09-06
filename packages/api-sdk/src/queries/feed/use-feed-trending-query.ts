import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useApiClientContext } from '../../react'
import type { ApiClientType } from '../../types/api-client.types'

type FeedTrendingQueryParams = {
  locationCityName?: string
  latLng?: {
    latitude: number
    longitude: number
  }
  size?: number
  placeholderData?: Awaited<ReturnType<ApiClientType['event']['getTrending']>>
}

export const useFeedTrendingQuery = ({
  locationCityName,
  latLng,
  size = 6,
  placeholderData,
}: FeedTrendingQueryParams) => {
  const { apiClient } = useApiClientContext()
  return useQuery(
    feedTrendingQueryOptions(apiClient, {
      locationCityName,
      latLng,
      size,
      placeholderData,
    }),
  )
}

export const feedTrendingQueryOptions = (
  apiClient: ApiClientType,
  { locationCityName, latLng, size = 6, placeholderData }: FeedTrendingQueryParams,
) => {
  return {
    queryKey: apiClient.event.queryKeys.trending.feed({
      locationCityName,
      size,
      cursor: undefined,
      direction: 'next',
      latLng,
    }),
    queryFn: () =>
      apiClient.event.getTrending({
        size,
        locationCityName,
        cursor: undefined,
        direction: 'next',
        latLng,
      }),
    meta: {
      persist: true,
    },
    placeholderData,
  } satisfies UseQueryOptions
}
