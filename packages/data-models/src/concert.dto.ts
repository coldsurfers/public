import { z } from 'zod'
import { ArtistDTOSchema } from './artist.dto'
import { CopyrightDTOSchema } from './copyright.dto'
import { DetailImageDTOSchema } from './detail-image.dto'
import { EventCategoryDTOSchema } from './event-category.dto'
import { LocationCityDTOSchema } from './location.dto'
import { PosterDTOSchema } from './poster.dto'
import { TicketDTOSchema } from './ticket.dto'
import { UserDTOSchema } from './user.dto'
import { VenueDTOSchema } from './venue.dto'

export const ConcertMainPosterDTOSchema = z.object({
  url: z.string().nullable(),
  copyright: CopyrightDTOSchema.nullable(),
})
export type ConcertMainPosterDTO = z.infer<typeof ConcertMainPosterDTOSchema>

export const ConcertStatusDTOSchema = z
  .union([z.literal('DRAFT'), z.literal('PUBLISHED')])
  .nullable()
export type ConcertStatusDTO = z.infer<typeof ConcertStatusDTOSchema>

export const ConcertDTOSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string().datetime(),
  // 등재 시점 — `/v2/events/new` 는 서버에서 createdAt desc 로 정렬하지만 값 자체는 안 실어왔다.
  // 홈 피드가 개최일(미래) 대신 이 축으로 Stage 카드를 정렬한다. optional: `toConcertDTO` 는 항상
  // 채우되, required 로 올리면 별도 빌더(`toLocationConcertDTO` 등)가 깨져서 optional 유지.
  createdAt: z.string().datetime().optional(),
  mainPoster: ConcertMainPosterDTOSchema.nullable(),
  mainVenue: z
    .object({
      name: z.string(),
    })
    .nullable(),
  slug: z.string().nullable(),
  plainVenueText: z.string().nullable(),
  status: ConcertStatusDTOSchema,
  viewCount: z.number().optional(),
  isSubscribed: z.boolean().optional(),
  category: EventCategoryDTOSchema.optional(),
  entryTicketCapacity: z.number().int().nullable().optional(),
})
export type ConcertDTO = z.infer<typeof ConcertDTOSchema>

export const LocationConcertDTOSchema = ConcertDTOSchema.extend({
  latitude: z.number(),
  longitude: z.number(),
})
export type LocationConcertDTO = z.infer<typeof LocationConcertDTOSchema>

/**
 * `GET /v2/events/recently-viewed` 전용 — 공연 + **그 공연이 마지막으로 조회된 시각.**
 *
 * `ConcertDTO` 를 넓히지 않고 확장으로 둔 이유: `lastViewedAt` 은 공연의 속성이 아니라
 * `ConcertViewStat` 의 속성이라 다른 피드에선 채울 값이 없다(전부 `undefined` 가 된다).
 * ⚠️ 값의 뜻은 "마지막 조회" 가 아니라 **"새 조회자의 마지막 유입"** — `trackEventView` 가
 * `isNewView` 일 때만 갱신한다. 라우트 주석과 같은 각주다.
 */
export const RecentlyViewedEventDTOSchema = ConcertDTOSchema.extend({
  lastViewedAt: z.string().datetime(),
})
export type RecentlyViewedEventDTO = z.infer<typeof RecentlyViewedEventDTOSchema>

/**
 * `GET /v2/events/stats` — 랜딩 히어로가 재고 규모를 문장으로 말하기 위한 수치 3개.
 *
 * 기존 목록 응답에서 파생하지 않는다: 장르 미라벨 공연이 통째로 빠져 총 건수가 실제보다 작게
 * 나오고, 라벨 커버리지 부패가 그대로 숫자에 반영된다. 창은 `/v2/genres` 와 같은 upcoming 고정.
 */
export const EventStatsDTOSchema = z.object({
  /** upcoming(`date >= now`) PUBLISHED 공연 수. */
  upcoming: z.number(),
  /** 그중 앞으로 7일 안에 열리는 수. */
  thisWeek: z.number(),
  /** upcoming 공연이 한 건이라도 걸린 공연장 수. */
  venues: z.number(),
})
export type EventStatsDTO = z.infer<typeof EventStatsDTOSchema>

export const ConcertDetailDTOSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string().datetime(),
  posters: PosterDTOSchema.array(),
  venues: VenueDTOSchema.array(),
  artists: ArtistDTOSchema.array(),
  tickets: TicketDTOSchema.array(),
  isKOPIS: z.boolean(),
  slug: z.string().nullable(),
  detailImages: DetailImageDTOSchema.array(),
  noticeText: z.string().nullable(),
  plainVenueText: z.string().nullable(),
  user: UserDTOSchema.pick({
    id: true,
  }).nullable(),
  category: EventCategoryDTOSchema.nullable(),
  locationCity: LocationCityDTOSchema.nullable(),
  isSubscribed: z.boolean().optional(),
  status: ConcertStatusDTOSchema,
})
export type ConcertDetailDTO = z.infer<typeof ConcertDetailDTOSchema>

export const FindManyConcertDTOSchema = z.object({
  titleContains: z.string().optional(),
  orderBy: z.union([z.literal('latest'), z.literal('oldest')]),
  take: z.number(),
  skip: z.number(),
  venueGeohash: z.string().nullable(),
  locationCityId: z.string().uuid().nullable(),
  eventCategoryName: z.string().nullable(),
  locationCityName: z.string().nullable(),
  userId: z.string().uuid().optional(),
})
export type FindManyConcertDTO = z.infer<typeof FindManyConcertDTOSchema>

export const FindManyByVenueIdConcertDTOSchema = z.object({
  venueId: z.string(),
  orderBy: z.union([z.literal('latest'), z.literal('oldest')]),
  take: z.number(),
  skip: z.number(),
})
export type FindManyByVenueIdConcertDTO = z.infer<typeof FindManyByVenueIdConcertDTOSchema>

export const FindManyByArtistIdConcertDTOSchema = z.object({
  artistId: z.string(),
  orderBy: z.union([z.literal('latest'), z.literal('oldest')]),
  take: z.number(),
  skip: z.number(),
})
export type FindManyByArtistIdConcertDTO = z.infer<typeof FindManyByArtistIdConcertDTOSchema>

export const SubscribeUnsubscribeConcertDTOSchema = z.object({
  concertId: z.string(),
  userId: z.string(),
})
export type SubscribeUnsubscribeConcertDTO = z.infer<typeof SubscribeUnsubscribeConcertDTOSchema>

export const GetConcertByIdParamsDTOSchema = z.object({
  id: z.string(),
})
export type GetConcertByIdParamsDTO = z.infer<typeof GetConcertByIdParamsDTOSchema>

export const GetConcertListQueryStringDTOSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(0).default(0),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
})
export type GetConcertListQueryStringDTO = z.infer<typeof GetConcertListQueryStringDTOSchema>

export const ConcertSearchQueryStringDTOSchema = z.object({
  keyword: z.string(),
  offset: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(0).default(0),
})
export type ConcertSearchQueryStringDTO = z.infer<typeof ConcertSearchQueryStringDTOSchema>
