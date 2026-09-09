import { z } from 'zod'
import { ConcertDetailDTOSchema, ConcertDTOSchema } from './concert.dto'
import { OffsetPaginationDTOSchema } from './pagination.dto'
import { TicketPromotionDTOSchema } from './ticket.dto'

export const EventDTOSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('concert'),
    data: ConcertDTOSchema,
  }),
])
export type EventDTO = z.infer<typeof EventDTOSchema>

export const EventDetailDTOSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('concert'),
    data: ConcertDetailDTOSchema.extend({
      ticketPromotion: TicketPromotionDTOSchema.nullable(),
    }),
  }),
])
export type EventDetailDTO = z.infer<typeof EventDetailDTOSchema>

export const GetEventsQueryStringDTOSchema = OffsetPaginationDTOSchema.extend({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  /**
   * @TODO: locationCityId should be replaced by locationCityName
   */
  locationCityId: z.string().uuid().optional(),
  locationCityName: z.string().optional(),
  eventCategoryName: z.string().optional(),
})
export type GetEventsQueryStringDTO = z.infer<typeof GetEventsQueryStringDTOSchema>

export const GetEventDetailByIdParamsDTOSchema = z.object({
  eventId: z.string(),
})
export type GetEventDetailByIdParamsDTO = z.infer<typeof GetEventDetailByIdParamsDTOSchema>

export const GetEventDetailBySlugParamsDTOSchema = z.object({
  slug: z.string(),
})
export type GetEventDetailBySlugParamsDTO = z.infer<typeof GetEventDetailBySlugParamsDTOSchema>

export const GetEventDetailBySlugQuerystringDTOSchema = z.object({
  slug: z.string().optional(),
})
export type GetEventDetailBySlugQuerystringDTO = z.infer<
  typeof GetEventDetailBySlugQuerystringDTOSchema
>

export const PatchDraftEventQuerystringDTOSchema = z.object({
  id: z.string(),
})
export type PatchDraftEventQuerystringDTO = z.infer<typeof PatchDraftEventQuerystringDTOSchema>

const BaseDraftEventDataDTOSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  venue: z
    .object({
      venueId: z.string().optional(),
      plainVenueText: z.string().optional(),
    })
    .optional(),
  noticeText: z.string().optional(),
  posterImageId: z.string().optional(),
  detailImageIds: z.array(z.string().uuid()).optional(),
  ticketIds: z.array(z.string().uuid()).optional(),
  eventCategoryId: z.string().uuid().optional(),
  locationCityId: z.string().uuid().optional(),
})

export const DraftEventDataDTOSchema = BaseDraftEventDataDTOSchema

export type DraftEventDataDTO = z.infer<typeof DraftEventDataDTOSchema>

export const SaveDraftEventInputDTOSchema = z.object({
  draftId: z.string().uuid(),
  data: DraftEventDataDTOSchema.extend({
    userId: z.string().uuid(),
  }),
})
export type SaveDraftEventInputDTO = z.infer<typeof SaveDraftEventInputDTOSchema>

export const EventCollectionDTOSchema = z.object({
  key: z.string(),
  title: z.string(),
  events: EventDTOSchema.array(),
  serialNumber: z.number(),
})
export type EventCollectionDTO = z.infer<typeof EventCollectionDTOSchema>

export const GetEventDraftByIdParamsDTOSchema = z.object({
  draftId: z.string(),
})
export type GetEventDraftByIdParamsDTO = z.infer<typeof GetEventDraftByIdParamsDTOSchema>

export const PublishDraftEventParamsDTOSchema = z.object({
  draftId: z.string(),
})
export type PublishDraftEventParamsDTO = z.infer<typeof PublishDraftEventParamsDTOSchema>

export const UpdateEventStatusBodyParamsDTOSchema = z.object({
  status: z.union([z.literal('published'), z.literal('draft')]),
})
export type UpdateEventStatusBodyParamsDTO = z.infer<typeof UpdateEventStatusBodyParamsDTOSchema>

export const DeleteEventParamsDTOSchema = z.object({
  eventId: z.string(),
})
export type DeleteEventParamsDTO = z.infer<typeof DeleteEventParamsDTOSchema>

export const GetRecommendedEventsQueryStringDTOSchema = z.object({
  locationCityId: z.string().uuid().optional(),
  eventCategoryId: z.string().uuid().optional(),
})
export type GetRecommendedEventsQueryStringDTO = z.infer<
  typeof GetRecommendedEventsQueryStringDTOSchema
>

export const FindEventsQueryStringDTOSchema = z.object({
  locationCityName: z.string().optional(),
  eventCategoryName: z.string().optional(),
})
export type FindEventsQueryStringDTO = z.infer<typeof FindEventsQueryStringDTOSchema>
