import createFetchClient, { type Client, type Middleware } from 'openapi-fetch'
import { OpenApiError } from './error'
import type { components, paths } from './types/api.gen'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

type FetchClient = Client<paths, `${string}/${string}`>

// Next.js fetch 확장 타입 — Next.js 없는 환경에서도 타입 에러 없이 사용 가능
type NextFetchRequestConfig = {
  revalidate?: number | false
  tags?: string[]
}

export type FetchOptions = {
  next?: NextFetchRequestConfig
  cache?: RequestCache
}

/** 알림 목록의 종류 필터 축 — `Feed.entityType`. 알림 지면 카테고리 레일이 이걸로 거른다. */
export type NotificationFeedEntityType = NonNullable<
  paths['/v1/notifications']['get']['parameters']['query']['type']
>

export const getApiClient = (baseFetchClient: FetchClient) => {
  const apiClient = {
    feed: {
      queryKeys: {
        all: ['feed'] as const,
        list: {
          all: () => [...apiClient.feed.queryKeys.all, 'list'],
          byCursor: (
            cursor: components['schemas']['CursorPaginationQueryStringDTOSchema'],
            {
              definitionId,
            }: {
              definitionId?: string
            },
          ) => [...apiClient.feed.queryKeys.list.all(), cursor, { definitionId }],
        },
        detail: {
          all: () => [...apiClient.feed.queryKeys.all, 'detail'],
          byFeedId: (feedId: string) => [...apiClient.feed.queryKeys.detail.all(), feedId],
        },
        definitions: ['feed', 'definitions'],
      },
      fetchFeedList: async (
        cursor: components['schemas']['CursorPaginationQueryStringDTOSchema'],
        { definitionId }: { definitionId?: string },
      ) => {
        const response = await baseFetchClient.GET('/v2/feeds', {
          params: {
            query: {
              ...cursor,
              definitionId,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      fetchFeedDetail: async ({ feedId }: { feedId: string }) => {
        const response = await baseFetchClient.GET('/v2/feeds/{feedId}', {
          params: {
            path: {
              feedId,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      fetchFeedDefinitions: async () => {
        const response = await baseFetchClient.GET('/v2/feeds/definitions')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    event: {
      queryKeys: {
        all: ['event'],
        allList: () => [...apiClient.event.queryKeys.all, 'list'],
        list: ({
          latitude,
          longitude,
          offset,
          size,
          locationCityId,
          eventCategoryName,
          locationCityName,
        }: {
          latitude?: number
          longitude?: number
          offset?: number
          size?: number
          locationCityId?: string
          eventCategoryName?: string
          locationCityName?: string
        }) => [
          ...apiClient.event.queryKeys.allList(),
          {
            latitude,
            longitude,
            offset,
            size,
            locationCityId,
            eventCategoryName,
            locationCityName,
          },
        ],
        detail: (id: string) => ['event', 'detail', id],
        detailBySlug: (slug: string) => ['event', 'detail', 'slug', slug],
        collections: ['event', 'collections'],
        stats: ['event', 'stats'],
        draft: ['event', 'draft'],
        draftById: ({ draftId }: { draftId: string }) => [
          ...apiClient.event.queryKeys.draft,
          { draftId },
        ],
        created: ['event', 'created'],
        recommended: ({
          locationCityId,
          eventCategoryId,
        }: {
          locationCityId?: string
          eventCategoryId?: string
        }) => ['event', 'recommended', { locationCityId, eventCategoryId }],
        newEvents: {
          all: ['event', 'new'] as const,
          feed: ({
            cursor,
            direction,
            eventCategoryName,
            locationCityName,
            size,
          }: {
            cursor?: string
            size?: number
            direction: 'next' | 'prev'
            eventCategoryName?: string
            locationCityName?: string
          }) => [
            ...apiClient.event.queryKeys.newEvents.all,
            'feed',
            { cursor, direction, eventCategoryName, locationCityName, size },
          ],
        },
        tonightEvents: {
          all: ['event', 'tonight'] as const,
          feed: ({
            cursor,
            direction,
            eventCategoryName,
            locationCityName,
            size,
          }: {
            cursor?: string
            size?: number
            direction: 'next' | 'prev'
            eventCategoryName?: string
            locationCityName?: string
          }) => [
            ...apiClient.event.queryKeys.tonightEvents.all,
            'feed',
            { cursor, direction, eventCategoryName, locationCityName, size },
          ],
        },
        recent: {
          all: ['event', 'recent'] as const,
          anonymousUser: ({ anonymousUserId }: { anonymousUserId?: string }) => [
            ...apiClient.event.queryKeys.recent.all,
            'anonymous-user',
            { anonymousUserId },
          ],
        },
        trending: {
          all: ['event', 'trending'] as const,
          feed: ({
            cursor,
            direction,
            locationCityName,
            size,
            latLng,
          }: {
            cursor?: string
            direction: 'next' | 'prev'
            locationCityName?: string
            size?: number
            latLng?: {
              latitude: number
              longitude: number
            }
          }) => [
            ...apiClient.event.queryKeys.trending.all,
            'feed',
            { cursor, direction, locationCityName, size, latLng },
          ],
        },
        kopis: {
          all: ['v1', 'event', 'kopis'],
          list: {
            all: () => [...apiClient.event.queryKeys.kopis.all, 'list'],
            byYYYYMMDD: (
              params: {
                yyyymmdd: string
                eventCategoryId?: string
              } & components['schemas']['CursorPaginationQueryStringDTOSchema'],
            ) => [...apiClient.event.queryKeys.kopis.all, 'list', params],
          },
        },
        weekend: {
          all: ['v1', 'event', 'weekend'],
          list: {
            all: () => [...apiClient.event.queryKeys.weekend.all, 'list'],
            byYYYYMMDD: (
              params: {
                yyyymmdd: string
                eventCategoryId?: string
              } & components['schemas']['CursorPaginationQueryStringDTOSchema'],
            ) => [...apiClient.event.queryKeys.weekend.list.all(), params],
          },
        },
      },
      getEvents: async ({
        offset,
        size,
        latitude,
        longitude,
        locationCityId,
        eventCategoryName,
        locationCityName,
      }: {
        offset: number
        size: number
        latitude?: number
        longitude?: number
        locationCityId?: string
        eventCategoryName?: string
        locationCityName?: string
      }) => {
        const response = await baseFetchClient.GET('/v2/events', {
          params: {
            query: {
              offset,
              size,
              latitude,
              longitude,
              locationCityId,
              eventCategoryName,
              locationCityName,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getKopisEvents: async (
        params: {
          yyyymmdd?: string
          eventCategoryId?: string
        } & components['schemas']['CursorPaginationQueryStringDTOSchema'],
      ) => {
        const response = await baseFetchClient.GET('/v2/events/kopis', {
          params: {
            query: params,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getWeekendEvents: async (
        params: {
          eventCategoryId?: string
          yyyymmdd?: string
        } & components['schemas']['CursorPaginationQueryStringDTOSchema'],
      ) => {
        const response = await baseFetchClient.GET('/v2/events/weekend', {
          params: {
            query: params,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getTrending: async ({
        cursor,
        direction,
        locationCityName,
        size,
        latLng,
      }: {
        cursor?: string
        direction: 'next' | 'prev'
        locationCityName?: string
        size?: number
        latLng?: {
          latitude: number
          longitude: number
        }
      }) => {
        const response = await baseFetchClient.GET('/v2/events/trending', {
          params: {
            query: {
              cursor,
              direction,
              locationCityName,
              size,
            },
          },
          headers: {
            'x-lat-lng': latLng ? `${latLng.longitude},${latLng.latitude}` : undefined,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getRecommendedEvents: async ({
        locationCityId,
        eventCategoryId,
      }: {
        locationCityId?: string
        eventCategoryId?: string
      }) => {
        const response = await baseFetchClient.GET('/v2/events/recommended', {
          params: {
            query: {
              locationCityId,
              eventCategoryId,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getRecentEvents: async ({ anonymousUserId }: { anonymousUserId?: string }) => {
        const response = await baseFetchClient.GET('/v2/events/recent', {
          headers: {
            'x-anonymous-user-id': anonymousUserId,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      /// getRecentEvents 의 글로벌(비개인화) 짝. 신원 헤더를 보내지 않는다 — 서버가 아예 안 본다.
      getRecentlyViewedEvents: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/events/recently-viewed', fetchOptions)
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      /// 재고 규모 수치 3개. 목록이 아니라 집계라 응답이 배열이 아닌 객체 하나다 —
      /// 랜딩 히어로가 "N개의 공연이 예정" 을 목록 길이로 세지 않게 하는 것이 존재 이유.
      getEventStats: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/events/stats', fetchOptions)
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getEventDetail: async (id: string, fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/events/{eventId}', {
          params: {
            path: {
              eventId: id,
            },
          },
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getEventDetailBySlug: async (slug: string, fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/events/slug/{slug}', {
          params: {
            path: {
              slug,
            },
          },
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      trackView: async ({
        concertId,
        anonymousUserId,
        ua,
      }: {
        concertId: string
        anonymousUserId?: string
        ua?: string
      }) => {
        const response = await baseFetchClient.POST('/v2/events/{eventId}/views', {
          params: {
            path: {
              eventId: concertId,
            },
          },
          body: {
            ua,
          },
          headers: {
            'x-anonymous-user-id': anonymousUserId,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getCollections: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/events/collections', {
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      saveDraft: async ({
        draftId,
        data,
      }: {
        draftId: string
        data: components['schemas']['DraftEventDataDTOSchema']
      }) => {
        const response = await baseFetchClient.PUT('/v2/event-drafts/{draftId}', {
          params: {
            path: {
              draftId,
            },
          },
          body: data,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getDraftById: async ({ draftId }: { draftId: string }) => {
        const response = await baseFetchClient.GET('/v2/event-drafts/{draftId}', {
          params: {
            path: {
              draftId,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      deleteEvent: async ({ eventId }: { eventId: string }) => {
        const response = await baseFetchClient.DELETE('/v2/events/{eventId}', {
          params: {
            path: {
              eventId,
            },
          },
          body: {
            eventId,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getNewEvents: async ({
        cursor,
        size,
        direction,
        eventCategoryName,
        locationCityName,
      }: {
        cursor?: string
        size?: number
        direction: 'next' | 'prev'
        eventCategoryName?: string
        locationCityName?: string
      }) => {
        const response = await baseFetchClient.GET('/v2/events/new', {
          params: { query: { cursor, direction, eventCategoryName, locationCityName, size } },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getTonightEvents: async ({
        cursor,
        direction,
        eventCategoryName,
        locationCityName,
        size,
      }: {
        size?: number
        cursor?: string
        direction: 'next' | 'prev'
        eventCategoryName?: string
        locationCityName?: string
      }) => {
        const response = await baseFetchClient.GET('/v2/events/tonight', {
          params: { query: { cursor, direction, eventCategoryName, locationCityName, size } },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    review: {
      queryKeys: {
        all: ['v1', 'review'] as const,
        list: ({
          concertId,
          limit,
          sort,
        }: {
          concertId: string
          limit?: number
          sort?: 'latest' | 'highest' | 'lowest'
        }) => [...apiClient.review.queryKeys.all, 'list', { concertId, limit, sort }],
        summary: ({ concertId }: { concertId: string }) => [
          ...apiClient.review.queryKeys.all,
          'summary',
          { concertId },
        ],
        myReview: ({ concertId }: { concertId: string }) => [
          ...apiClient.review.queryKeys.all,
          'myReview',
          { concertId },
        ],
      },
      getReviews: async ({
        concertId,
        cursor,
        limit,
        sort,
      }: {
        concertId: string
        cursor?: string
        limit?: number
        sort?: 'latest' | 'highest' | 'lowest'
      }) => {
        const response = await baseFetchClient.GET('/v1/review/events/{concertId}', {
          params: {
            path: { concertId },
            query: { cursor, limit, sort },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getReviewSummary: async ({ concertId }: { concertId: string }) => {
        const response = await baseFetchClient.GET('/v1/review/events/{concertId}/summary', {
          params: {
            path: { concertId },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getMyReview: async ({ concertId }: { concertId: string }) => {
        const response = await baseFetchClient.GET('/v1/review/events/{concertId}/me', {
          params: {
            path: { concertId },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      createReview: async ({
        concertId,
        payload,
      }: {
        concertId: string
        payload: components['schemas']['CreateReviewBodyDTOSchema']
      }) => {
        const response = await baseFetchClient.POST('/v1/review/events/{concertId}', {
          params: {
            path: { concertId },
          },
          body: payload,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      updateReview: async ({
        reviewId,
        payload,
      }: {
        reviewId: string
        payload: components['schemas']['UpdateReviewBodyDTOSchema']
      }) => {
        const response = await baseFetchClient.PATCH('/v1/review/{reviewId}', {
          params: {
            path: { reviewId },
          },
          body: payload,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      deleteReview: async ({ reviewId }: { reviewId: string }) => {
        const response = await baseFetchClient.DELETE('/v1/review/{reviewId}', {
          params: {
            path: { reviewId },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    comment: {
      queryKeys: {
        all: ['v2', 'comment'] as const,
        // threadKey 를 별도 슬롯으로 노출 — invalidateQueries 가 prefix 매치로 모든 limit 의
        // list 캐시를 한 번에 무효화할 수 있게 함.
        list: ({ threadKey, limit }: { threadKey: string; limit?: number }) => [
          ...apiClient.comment.queryKeys.all,
          'list',
          threadKey,
          { limit },
        ],
        listByThreadKey: ({ threadKey }: { threadKey: string }) => [
          ...apiClient.comment.queryKeys.all,
          'list',
          threadKey,
        ],
      },
      listComments: async ({
        threadKey,
        cursor,
        limit,
      }: {
        threadKey: string
        cursor?: string
        limit?: number
      }) => {
        const response = await baseFetchClient.GET('/v2/comments', {
          params: {
            query: { threadKey, cursor, limit },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      createComment: async ({
        payload,
      }: {
        payload: NonNullable<
          paths['/v2/comments']['post']['requestBody']
        >['content']['application/json']
      }) => {
        const response = await baseFetchClient.POST('/v2/comments', {
          body: payload,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      deleteComment: async ({ commentId }: { commentId: string }) => {
        const response = await baseFetchClient.DELETE('/v2/comments/{commentId}', {
          params: {
            path: { commentId },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    eventRsvp: {
      queryKeys: {
        all: ['event-rsvp'],
        counts: ({ eventId, anonymousUserId }: { eventId: string; anonymousUserId: string }) => [
          'event-rsvp',
          'counts',
          { eventId, anonymousUserId },
        ],
        list: ['event-rsvp', 'list'],
      },
      getEventRsvpCounts: async ({
        eventId,
        anonymousUserId,
      }: {
        eventId: string
        anonymousUserId: string
      }) => {
        const response = await baseFetchClient.GET('/v1/event-rsvp/{eventId}/counts', {
          params: {
            path: { eventId },
          },
          headers: {
            'x-anonymous-user-id': anonymousUserId,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      updateEventRsvp: async ({
        eventId,
        action,
        anonymousUserId,
      }: {
        eventId: string
        action: components['schemas']['EventRsvpUpdateActionDTOSchema']
        anonymousUserId: string
      }) => {
        const response = await baseFetchClient.POST('/v1/event-rsvp/{eventId}/counts', {
          params: {
            path: { eventId },
          },
          body: action,
          headers: {
            'x-anonymous-user-id': anonymousUserId,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getEventRsvpList: async () => {
        const response = await baseFetchClient.GET('/v1/event-rsvp')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    eventCategory: {
      queryKeys: {
        all: ['event-category'],
        list: ['event-category', 'list'],
      },
      getEventCategories: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v1/event-category', {
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    /// 장르 칩 목록. `event` 가 아니라 독립 네임스페이스인 이유 — `/v2/genres` 는 이벤트의
    /// 하위자원이 아니라 그 자체가 리소스다(응답에 이벤트가 한 건도 안 들어간다).
    genre: {
      queryKeys: {
        all: ['genre'],
        list: ['genre', 'list'],
      },
      /// 상수가 아니라 **재고에서 파생한** 칩 목록 — 서버가 upcoming 공연에 실제로 붙은 것만 준다.
      /// 그래서 `GENRE_CHIPS` 를 import 하는 것과 결과가 다를 수 있고, 그게 이 API 의 존재 이유다.
      getGenres: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/genres', fetchOptions)
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    location: {
      queryKeys: {
        all: ['location'],
        countries: ['location', 'countries'],
        counts: ['location', 'counts'],
        concerts: (queryParams: {
          latitude: number
          latitudeDelta: number
          longitude: number
          longitudeDelta: number
          zoomLevel: number
        }) => ['location', 'concerts', queryParams],
      },
      getCountries: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v1/location/country', {
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      /// 도시별 upcoming 건수. `getCountries` 가 도시 *행*(좌표·geohash)을 주는 것과 달리
      /// 여기선 재고 관측만 준다 — 건수 0인 도시는 응답에 아예 없다.
      getLocationCounts: async (fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/locations', fetchOptions)
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getConcerts: async (queryParams: {
        latitude: number
        latitudeDelta: number
        longitude: number
        longitudeDelta: number
        zoomLevel: number
      }) => {
        const response = await baseFetchClient.GET('/v1/location/concert', {
          params: {
            query: queryParams,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    mailer: {
      sendUserVoice: async (body: components['schemas']['SendUserVoiceBodyDTOSchema']) => {
        const response = await baseFetchClient.POST('/v1/mailer/user-voice', {
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    ticket: {
      queryKeys: {
        all: ['ticket'],
        list: ({ eventId }: { eventId: string }) => ['ticket', 'list', { eventId }],
      },
      getTicketsByEventId: async (eventId: string) => {
        const response = await baseFetchClient.GET('/v1/ticket/', {
          params: {
            query: {
              eventId,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    venue: {
      queryKeys: {
        all: ['venue'],
        list: ({
          locationCityName,
          offset,
          size,
        }: {
          locationCityName?: string
          offset?: number
          size?: number
        }) => ['venue', 'list', { locationCityName, offset, size }],
        detail: (venueId: string) => ['venue', 'detail', venueId],
        detailBySlug: (venueSlug: string) => ['venue', 'detail', venueSlug],
      },
      getVenueDetail: async (venueId: string, fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/venues/{id}', {
          params: {
            path: {
              id: venueId,
            },
          },
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getVenueDetailBySlug: async (slug: string, fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/venues/slug/{slug}', {
          params: {
            path: {
              slug,
            },
          },
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getVenueList: async (params: {
        locationCityName?: string
        offset?: number
        size?: number
      }) => {
        const response = await baseFetchClient.GET('/v2/venues', {
          params: {
            query: params,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    artist: {
      queryKeys: {
        all: ['artist'],
        detail: (artistId: string) => ['artist', 'detail', artistId],
      },
      getArtistDetail: async (artistId: string, fetchOptions?: FetchOptions) => {
        const response = await baseFetchClient.GET('/v2/artists/{id}', {
          params: {
            path: {
              id: artistId,
            },
          },
          ...fetchOptions,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    fcm: {
      saveFcmToken: async (fcmToken: string) => {
        const response = await baseFetchClient.POST('/v1/fcm/token', {
          body: {
            fcmToken,
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    artistProfileImage: {
      queryKeys: {
        all: ['v1', 'artist-profile-image'],
        list: ({ artistId }: { artistId: string }) => [
          'v1',
          'artist-profile-image',
          'list',
          { artistId },
        ],
        detail: ({ artistProfileImageId }: { artistProfileImageId: string }) => [
          'v1',
          'artist-profile-image',
          'detail',
          { artistProfileImageId },
        ],
      },
      getList: async ({ artistId }: { artistId: string }, fetchOptions?: FetchOptions) => {
        const data = await baseFetchClient.GET('/v2/artists/{artistId}/profile-images', {
          params: {
            path: {
              artistId,
            },
          },
          ...fetchOptions,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getDetail: async ({
        artistId,
        artistProfileImageId,
      }: {
        artistId: string
        artistProfileImageId: string
      }) => {
        const data = await baseFetchClient.GET(
          '/v2/artists/{artistId}/profile-images/{artistProfileImageId}',
          {
            params: {
              path: {
                artistId,
                artistProfileImageId,
              },
            },
          },
        )
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    subscribe: {
      queryKeys: {
        all: ['v1', 'subscribe'],
        eventList: ({ offset, size }: { offset?: number; size?: number }) => [
          'v1',
          'subscribe',
          'list',
          'event',
          { offset, size },
        ],
        artistList: ({ offset, size }: { offset?: number; size?: number }) => [
          'v1',
          'subscribe',
          'list',
          'artist',
          { offset, size },
        ],
        venueList: ({ offset, size }: { offset?: number; size?: number }) => [
          'v1',
          'subscribe',
          'list',
          'venue',
          { offset, size },
        ],
        eventSubscribe: ({ eventId }: { eventId: string }) => [
          'v1',
          'subscribe',
          'event',
          { eventId },
        ],
        artistSubscribe: ({ artistId }: { artistId: string }) => [
          'v1',
          'subscribe',
          'artist',
          { artistId },
        ],
        venueSubscribe: ({ venueId }: { venueId: string }) => [
          'v1',
          'subscribe',
          'venue',
          { venueId },
        ],
        infoMe: ['v1', 'subscribe', 'me'],
      },
      getEventList: async (params: { offset: number; size: number }) => {
        const data = await baseFetchClient.GET('/v2/users/me/subscriptions/events', {
          params: {
            query: params,
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getArtistList: async (params: { offset: number; size: number }) => {
        const data = await baseFetchClient.GET('/v2/users/me/subscriptions/artists', {
          params: {
            query: params,
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getVenueList: async (params: { offset: number; size: number }) => {
        const data = await baseFetchClient.GET('/v2/users/me/subscriptions/venues', {
          params: {
            query: params,
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getEvent: async ({ eventId }: { eventId: string }) => {
        const data = await baseFetchClient.GET('/v1/subscribe/event/{eventId}', {
          params: {
            path: {
              eventId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getVenue: async ({ venueId }: { venueId: string }) => {
        const data = await baseFetchClient.GET('/v2/venues/{venueId}/subscriptions/me', {
          params: {
            path: {
              venueId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getArtist: async ({ artistId }: { artistId: string }) => {
        const data = await baseFetchClient.GET('/v2/artists/{artistId}/subscriptions/me', {
          params: {
            path: {
              artistId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      subscribeEvent: async (params: { eventId: string }) => {
        const data = await baseFetchClient.POST('/v1/subscribe/event', {
          body: {
            eventId: params.eventId,
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      unsubscribeEvent: async (params: { eventId: string }) => {
        const data = await baseFetchClient.DELETE('/v1/subscribe/event', {
          body: {
            eventId: params.eventId,
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      subscribeArtist: async (params: { artistId: string }) => {
        const data = await baseFetchClient.POST('/v2/artists/{artistId}/subscriptions', {
          params: {
            path: {
              artistId: params.artistId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      unsubscribeArtist: async (params: { artistId: string }) => {
        const data = await baseFetchClient.DELETE('/v2/artists/{artistId}/subscriptions/me', {
          params: {
            path: {
              artistId: params.artistId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      subscribeVenue: async (params: { venueId: string }) => {
        const data = await baseFetchClient.POST('/v2/venues/{venueId}/subscriptions', {
          params: {
            path: {
              venueId: params.venueId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      unsubscribeVenue: async (params: { venueId: string }) => {
        const data = await baseFetchClient.DELETE('/v2/venues/{venueId}/subscriptions/me', {
          params: {
            path: {
              venueId: params.venueId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getInfoMe: async () => {
        const data = await baseFetchClient.GET('/v2/users/me/subscriptions')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    user: {
      queryKeys: {
        all: ['v1', 'user'],
        me: ['v1', 'user', 'me'],
        profile: (handle: string) => ['v1', 'user', 'profile', handle],
        mySocialLinks: ['v1', 'user', 'my-social-links'],
        socialLinks: (handle: string) => ['v1', 'user', 'social-links', handle],
        userPreferences: ['v1', 'user', 'preferences'],
        consentsRequired: ['v2', 'user', 'consents-required'],
      },
      getMe: async () => {
        const data = await baseFetchClient.GET('/v2/users/me')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      activate: async (
        body: NonNullable<
          paths['/v2/users/me']['patch']['requestBody']
        >['content']['application/json'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/me', {
          body: body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      deactivate: async () => {
        const data = await baseFetchClient.DELETE('/v2/users/me', {
          body: {
            type: 'deactivate',
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getUserProfile: async (handle: string) => {
        const data = await baseFetchClient.GET('/v2/users/{handle}', {
          params: {
            path: {
              handle,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getMySocialLinks: async () => {
        const data = await baseFetchClient.GET('/v2/users/me/social-links')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getUserSocialLinks: async (handle: string) => {
        const data = await baseFetchClient.GET('/v2/users/{handle}/social-links', {
          params: {
            path: {
              handle,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      updateUserSocialLinks: async (
        body: components['schemas']['UpdateUserSocialLinksBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/me/social-links', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getUserHandleAvailable: async (handle: string) => {
        const data = await baseFetchClient.GET('/v2/users/handle-availability', {
          params: {
            query: {
              handle,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      updateUserProfile: async (
        handle: string,
        body: components['schemas']['UpdateUserProfileByHandleBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/{handle}', {
          params: {
            path: {
              handle,
            },
          },
          body: body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getUserPreferences: async () => {
        const data = await baseFetchClient.GET('/v2/users/me/preferences')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      updateUserPreferences: async (
        body: components['schemas']['UpdateUserPreferencesBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/me/preferences', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      updateMarketingConsent: async (
        body: components['schemas']['UpdateMarketingConsentBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/me/marketing-consent', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      updateNightMarketingConsent: async (
        body: components['schemas']['UpdateNightMarketingConsentBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.PATCH('/v2/users/me/night-marketing-consent', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      getConsentsRequired: async () => {
        const data = await baseFetchClient.GET('/v2/users/me/consents/required')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      createTermsAgreement: async (
        body: components['schemas']['CreateTermsAgreementBodyDTOSchema'],
      ) => {
        const data = await baseFetchClient.POST('/v2/users/me/terms-agreements', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    price: {
      queryKeys: {
        all: ['v1', 'price'],
        list: ({ ticketId }: { ticketId: string }) => ['v1', 'price', 'list', { ticketId }],
      },
      getList: async ({ ticketId }: { ticketId: string }) => {
        const data = await baseFetchClient.GET('/v1/price/', {
          params: {
            query: {
              ticketId,
            },
          },
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    auth: {
      sendAuthCode: async (
        body: paths['/v2/auth/email/verification-codes']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/email/verification-codes', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      confirmAuthCode: async (
        body: paths['/v2/auth/email/verification-codes/verify']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/email/verification-codes/verify', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      signup: async (
        body: paths['/v2/auth/users']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/users', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      signIn: async (
        body: paths['/v2/auth/sessions']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/sessions', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      reissueToken: async (
        body: paths['/v2/auth/tokens/refresh']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/tokens/refresh', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
      checkUser: async (
        body: paths['/v2/auth/check']['post']['requestBody']['content']['application/json'],
      ) => {
        const data = await baseFetchClient.POST('/v2/auth/check', {
          body,
        })
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    consents: {
      queryKeys: {
        required: ['v2', 'consents', 'required'],
      },
      getRequired: async () => {
        const data = await baseFetchClient.GET('/v2/consents/required')
        if (data.error) {
          throw new OpenApiError(data.error)
        }
        return data.data
      },
    },
    search: {
      queryKeys: {
        all: ['v1', 'search'],
        list: ({
          keyword,
          type,
        }: {
          keyword: string
          type?: components['schemas']['SearchListQueryStringDTOSchema']['type']
        }) => ['v1', 'search', { keyword, type }],
      },
      getSearchResult: async ({
        keyword,
        type,
      }: {
        keyword: string
        type?: components['schemas']['SearchListQueryStringDTOSchema']['type']
      }) => {
        const response = await baseFetchClient.GET('/v1/search', {
          params: {
            query: {
              keyword,
              type,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    app: {
      queryKeys: {
        all: ['v1', 'app'],
        updateInfo: ['v1', 'app', 'update-info'],
        remoteAppManifest: ['v1', 'app', 'remote-app-manifest'],
      },
      getAppUpdateInfo: async () => {
        const response = await baseFetchClient.GET('/v1/app/update-info')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getRemoteAppManifest: async () => {
        const response = await baseFetchClient.GET('/v1/app/remote-app-manifest')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    partner: {
      queryKeys: {
        all: ['partner'],
      },
      sendPartnerContactForm: async (
        body: components['schemas']['PartnerContactFormDTOSchema'],
      ) => {
        const response = await baseFetchClient.POST('/v1/partner/', {
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    entryTicket: {
      queryKeys: {
        all: ['entry-ticket'] as const,
        pool: {
          all: () => [...apiClient.entryTicket.queryKeys.all, 'pool'],
          byEventId: (eventId: string) => [...apiClient.entryTicket.queryKeys.all, 'pool', eventId],
        },
        me: ['entry-ticket', 'me'],
        detail: (params: { type: 'by-id'; id: string } | { type: 'by-slug'; slug: string }) => [
          ...apiClient.entryTicket.queryKeys.all,
          'detail',
          params,
        ],
      },
      getPool: async ({ eventId }: { eventId: string }) => {
        const response = await baseFetchClient.GET('/v2/entry-tickets/events/{eventId}', {
          params: { path: { eventId } },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      claimTicket: async ({ eventId }: { eventId: string }) => {
        const response = await baseFetchClient.POST('/v2/entry-tickets/events/{eventId}/claim', {
          params: { path: { eventId } },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      me: async () => {
        const response = await baseFetchClient.GET('/v2/entry-tickets/me')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getDetail: async (
        params: { type: 'by-id'; id: string } | { type: 'by-slug'; slug: string },
      ) => {
        if (params.type === 'by-id') {
          const response = await baseFetchClient.GET('/v2/entry-tickets/id/{id}', {
            params: { path: { id: params.id } },
          })
          if (response.error) {
            throw new OpenApiError(response.error)
          }
          return response.data
        }
        const response = await baseFetchClient.GET('/v2/entry-tickets/slug/{slug}', {
          params: { path: { slug: params.slug } },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    presign: {
      queryKeys: {
        all: ['v1', 'presign'],
        eventImages: ({
          concertId,
          resolution,
          type,
        }: components['schemas']['PresignPostBodyDTOSchema']) => [
          'v1',
          'presign',
          'event-images',
          { concertId, resolution, type },
        ],
      },
      postEventImagesPresigned: async (body: components['schemas']['PresignPostBodyDTOSchema']) => {
        const response = await baseFetchClient.POST('/v2/events/upload-tokens', {
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    publicAction: {
      queryKeys: {
        all: ['v1', 'public-action'],
        userPreferences: ({ actionToken }: { actionToken: string }) => [
          'v1',
          'public-action',
          'user-preferences',
          { actionToken },
        ],
        consentsRequired: ({ actionToken }: { actionToken: string }) => [
          'v1',
          'public-action',
          'consents-required',
          { actionToken },
        ],
      },
      getConsentsRequired: async ({ actionToken }: { actionToken: string }) => {
        const response = await baseFetchClient.GET('/v1/public-action/consents-required', {
          params: {
            query: { actionToken },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getUserPreferences: async ({ actionToken }: { actionToken: string }) => {
        const response = await baseFetchClient.GET('/v1/public-action/user-preferences', {
          params: {
            query: {
              actionToken,
            },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      updateUserPreferences: async ({
        actionToken,
        body,
      }: {
        actionToken: string
        body: components['schemas']['UpdateUserPreferencesBodyDTOSchema']
      }) => {
        const response = await baseFetchClient.PATCH('/v1/public-action/user-preferences', {
          params: {
            query: {
              actionToken,
            },
          },
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      updateMarketingConsent: async ({
        actionToken,
        body,
      }: {
        actionToken: string
        body: components['schemas']['UpdateMarketingConsentBodyDTOSchema']
      }) => {
        const response = await baseFetchClient.PATCH('/v1/public-action/marketing-consent', {
          params: {
            query: {
              actionToken,
            },
          },
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      updateNightMarketingConsent: async ({
        actionToken,
        body,
      }: {
        actionToken: string
        body: components['schemas']['UpdateNightMarketingConsentBodyDTOSchema']
      }) => {
        const response = await baseFetchClient.PATCH('/v1/public-action/night-marketing-consent', {
          params: {
            query: {
              actionToken,
            },
          },
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    survey: {
      voteColdsurfTicket: async (
        body: components['schemas']['SurveyActionColdsurfTicketDTOSchema'],
      ) => {
        const response = await baseFetchClient.POST('/v1/survey/count', {
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    newsletter: {
      unsubscribe: async ({ actionToken }: { actionToken: string }) => {
        const response = await baseFetchClient.GET('/v1/newsletter/unsubscribe', {
          params: {
            query: { actionToken },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      subscribe: async (body: components['schemas']['NewsletterSubscribeBodyDTOSchema']) => {
        const response = await baseFetchClient.POST('/v1/newsletter/subscribe', {
          body,
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    notification: {
      queryKeys: {
        all: ['v1', 'notification'] as const,
        list: ({
          cursor,
          direction,
          size,
          unread,
          type,
        }: {
          cursor?: string
          direction: 'next' | 'prev'
          size?: number
          unread?: 'true' | 'false'
          type?: NotificationFeedEntityType
        }) => [
          ...apiClient.notification.queryKeys.all,
          'list',
          { cursor, direction, size, unread, type },
        ],
        unreadCount: ['v1', 'notification', 'unread-count'] as const,
        counts: ['v1', 'notification', 'counts'] as const,
      },
      getList: async ({
        cursor,
        direction,
        size,
        unread,
        type,
      }: {
        cursor?: string
        direction: 'next' | 'prev'
        size?: number
        unread?: 'true' | 'false'
        type?: NotificationFeedEntityType
      }) => {
        const response = await baseFetchClient.GET('/v1/notifications', {
          params: {
            query: { cursor, direction, size, unread, type },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getCounts: async () => {
        const response = await baseFetchClient.GET('/v1/notifications/counts')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getUnreadCount: async () => {
        const response = await baseFetchClient.GET('/v1/notifications/unread-count')
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      markAsRead: async ({ id }: { id: string }) => {
        const response = await baseFetchClient.PATCH('/v1/notifications/{id}/read', {
          params: {
            path: { id },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      markAllAsRead: async () => {
        const response = await baseFetchClient.PATCH('/v1/notifications/read-all', {})
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
    termsVersion: {
      queryKeys: {
        all: ['v1', 'terms-version'],
        active: ({ type }: { type?: 'SERVICE' | 'PRIVACY' }) => [
          ...apiClient.termsVersion.queryKeys.all,
          'active',
          { type },
        ],
        visible: ({ type }: { type?: 'SERVICE' | 'PRIVACY' }) => [
          ...apiClient.termsVersion.queryKeys.all,
          'visible',
          { type },
        ],
      },
      getActive: async ({ type }: { type?: 'SERVICE' | 'PRIVACY' }) => {
        const response = await baseFetchClient.GET('/v1/terms-version/active', {
          params: {
            query: { type },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
      getVisible: async ({ type }: { type?: 'SERVICE' | 'PRIVACY' }) => {
        const response = await baseFetchClient.GET('/v1/terms-version', {
          params: {
            query: { type },
          },
        })
        if (response.error) {
          throw new OpenApiError(response.error)
        }
        return response.data
      },
    },
  } as const
  return apiClient
}

export class ApiSdk {
  public baseFetchClient: FetchClient

  constructor({ baseUrl }: { baseUrl: string }) {
    this.baseFetchClient = createFetchClient<paths>({
      baseUrl: baseUrl,
      headers: DEFAULT_HEADERS,
    })
  }

  public createSdk() {
    return getApiClient(this.baseFetchClient)
  }

  public addMiddlewares(callback: (apiClient: ReturnType<typeof getApiClient>) => Middleware[]) {
    this.baseFetchClient.use(...callback(getApiClient(this.baseFetchClient)))
    return this
  }
}
