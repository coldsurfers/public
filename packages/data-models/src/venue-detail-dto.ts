import { z } from 'zod'
import { EventDTOSchema } from './event.dto'
import { VenueDTOSchema } from './venue.dto'

export const VenueDetailDTOSchema = VenueDTOSchema.extend({
  upcomingEvents: EventDTOSchema.array(),
  previousEvents: EventDTOSchema.array(),
  // 목록이 잘려 와도 개수는 전체다 — 나머지는 `GET /v2/venues/:id/events` 로 더 받는다
  upcomingCount: z.number().int(),
  previousCount: z.number().int(),
})
export type VenueDetailDTO = z.infer<typeof VenueDetailDTOSchema>

// 공연장 공연 더보기 — upcoming: 가까운 날짜 순 · previous: 최근 날짜 순. cursor 는 서버가 준 값을 그대로 돌려준다
export const GetVenueEventsQueryDTOSchema = z.object({
  when: z.enum(['upcoming', 'previous']),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
})
export type GetVenueEventsQueryDTO = z.infer<typeof GetVenueEventsQueryDTOSchema>

export const VenueEventsPageDTOSchema = z.object({
  items: EventDTOSchema.array(),
  nextCursor: z.string().nullable(),
})
export type VenueEventsPageDTO = z.infer<typeof VenueEventsPageDTOSchema>
