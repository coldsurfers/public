import { z } from 'zod'

export const EventCategoryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type EventCategoryDTO = z.infer<typeof EventCategoryDTOSchema>

/** `EventCategory.name` 과 1:1. KOPIS 장르코드 매핑의 도착지(sync-kopis `categoryToEventCategoryId`). */
export const EVENT_CATEGORIES = [
  'Gigs',
  'Classic',
  'Theatre',
  'Korean-Traditional',
  'Dance',
] as const
export type EventCategoryName = (typeof EVENT_CATEGORIES)[number]
