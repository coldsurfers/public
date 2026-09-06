// dehydration 타입은 여기서 다시 내보낸다 — 소비자가 query-core 를 직접 물지 않게.
export type { DehydratedState } from '@tanstack/react-query'

import type { InfiniteData, UseInfiniteQueryOptions } from '@tanstack/react-query'
import type { FetchOptions, getApiClient } from '../api-sdk'
import type { OpenApiError } from '../error'
import type { components } from '../types/api.gen'
import type { ApiClientType } from '../types/api-client.types'

export const createPageQueries = (apiClient: ReturnType<typeof getApiClient>) => {
  return {
    home: () => {
      const size = 20
      return {
        queryKey: apiClient.event.queryKeys.list({ offset: 0, size }),
        queryFn: () =>
          apiClient.event.getEvents({
            offset: 0,
            size,
          }),
      }
    },
    homeCollections: (fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.event.queryKeys.collections,
        queryFn: () => apiClient.event.getCollections(fetchOptions),
      }
    },
    homeVenueCollection: (slug: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: ['home-collections', slug],
        queryFn: () => apiClient.venue.getVenueDetailBySlug(slug, fetchOptions),
      }
    },
    venueDetail: (venueId: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.venue.queryKeys.detail(venueId),
        queryFn: () => apiClient.venue.getVenueDetail(venueId, fetchOptions),
      }
    },
    venueDetailBySlug: (venueSlug: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.venue.queryKeys.detailBySlug(venueSlug),
        queryFn: () => apiClient.venue.getVenueDetailBySlug(venueSlug, fetchOptions),
      }
    },
    eventCategories: (fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.eventCategory.queryKeys.list,
        queryFn: () => apiClient.eventCategory.getEventCategories(fetchOptions),
      }
    },
    eventDetail: (eventId: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.event.queryKeys.detail(eventId),
        queryFn: () => apiClient.event.getEventDetail(eventId, fetchOptions),
      }
    },
    eventDetailBySlug: (slug: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.event.queryKeys.detailBySlug(slug),
        queryFn: () => apiClient.event.getEventDetailBySlug(slug, fetchOptions),
      }
    },
    artistDetail: (artistId: string, fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.artist.queryKeys.detail(artistId),
        queryFn: () => apiClient.artist.getArtistDetail(artistId, fetchOptions),
      }
    },
    getCountries: (fetchOptions?: FetchOptions) => {
      return {
        queryKey: apiClient.location.queryKeys.countries,
        queryFn: () => apiClient.location.getCountries(fetchOptions),
      }
    },
    browseEvents: ({
      cityName,
      eventCategoryName,
      size = 20,
    }: {
      cityName?: components['schemas']['LocationCityDTOSchema']['name']
      eventCategoryName?: components['schemas']['EventCategoryDTOSchema']['name']
      size?: number
    }) => {
      return {
        initialPageParam: 0,
        queryKey: apiClient.event.queryKeys.list({
          offset: 0,
          size,
          locationCityName: cityName,
          eventCategoryName,
        }),
        queryFn: ({ pageParam = 0 }: { pageParam?: string | number }) => {
          return apiClient.event.getEvents({
            offset: +pageParam,
            size,
            locationCityName: cityName,
            eventCategoryName,
          })
        },
        getNextPageParam: (
          lastPage: {
            data: components['schemas']['ConcertDTOSchema']
            type: 'concert'
          }[],
          allPages: {
            data: components['schemas']['ConcertDTOSchema']
            type: 'concert'
          }[][],
        ) => {
          return lastPage.length > 0 ? allPages.length * size : undefined
        },
        throwOnError: true,
      } satisfies UseInfiniteQueryOptions<
        Awaited<ReturnType<ApiClientType['event']['getEvents']>>,
        OpenApiError,
        InfiniteData<Awaited<ReturnType<ApiClientType['event']['getEvents']>>>,
        Awaited<ReturnType<ApiClientType['event']['getEvents']>>,
        ReturnType<ApiClientType['event']['queryKeys']['list']>,
        string | number | undefined
      >
    },
    browseVenues: ({
      cityName,
    }: {
      cityName: components['schemas']['LocationCityDTOSchema']['name']
    }) => {
      const size = 20
      return {
        initialPageParam: 0,
        queryKey: apiClient.venue.queryKeys.list({ offset: 0, size, locationCityName: cityName }),
        queryFn: ({ pageParam = 0 }) => {
          return apiClient.venue.getVenueList({
            offset: pageParam,
            size,
            locationCityName: cityName,
          })
        },
        getNextPageParam: (
          lastPage: components['schemas']['VenueDTOSchema'][],
          allPages: components['schemas']['VenueDTOSchema'][][],
        ) => {
          return lastPage.length > 0 ? allPages.length * size : undefined
        },
        throwOnError: true,
      }
    },
    browseNewEvents: ({
      cityName,
      cursor,
      eventCategoryName,
    }: {
      cityName: components['schemas']['LocationCityDTOSchema']['name']
      eventCategoryName?: components['schemas']['EventCategoryDTOSchema']['name']
      cursor?: string
    }) => {
      return {
        initialPageParam: cursor ?? undefined,
        queryKey: apiClient.event.queryKeys.newEvents.feed({
          cursor,
          locationCityName: cityName,
          direction: 'next',
          eventCategoryName,
        }),
        queryFn: async ({ pageParam }: { pageParam?: string }) =>
          apiClient.event.getNewEvents({
            cursor: pageParam,
            locationCityName: cityName,
            direction: 'next',
            eventCategoryName,
          }),
        getNextPageParam: (lastPage: {
          data: components['schemas']['EventDTOSchema'][]
          nextCursor: string | null
          prevCursor: string | null
        }) => {
          return lastPage.nextCursor ?? undefined
        },
        throwOnError: true,
      }
    },
    browseTonightEvents: ({
      cityName,
      cursor,
      eventCategoryName,
    }: {
      cityName: components['schemas']['LocationCityDTOSchema']['name']
      eventCategoryName?: components['schemas']['EventCategoryDTOSchema']['name']
      cursor?: string
    }) => {
      return {
        initialPageParam: cursor ?? undefined,
        queryKey: apiClient.event.queryKeys.tonightEvents.feed({
          cursor,
          locationCityName: cityName,
          direction: 'next',
          eventCategoryName,
        }),
        queryFn: async ({ pageParam }: { pageParam?: string }) =>
          apiClient.event.getTonightEvents({
            cursor: pageParam,
            locationCityName: cityName,
            direction: 'next',
            eventCategoryName,
          }),
        getNextPageParam: (lastPage: {
          data: components['schemas']['EventDTOSchema'][]
          nextCursor: string | null
          prevCursor: string | null
        }) => {
          return lastPage.nextCursor ?? undefined
        },
        throwOnError: true,
      }
    },
  }
}
