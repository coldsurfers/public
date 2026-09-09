import { z } from 'zod'
import { VenueDTOSchema } from './venue.dto'

export const EntryTicketStatusDTOSchema = z.union([
  z.literal('AVAILABLE'),
  z.literal('CLAIMED'),
  z.literal('USED'),
  z.literal('CANCELLED'),
])
export type EntryTicketStatusDTO = z.infer<typeof EntryTicketStatusDTOSchema>

export const EntryTicketVenueDTOSchema = VenueDTOSchema.pick({ id: true, name: true })
export type EntryTicketVenueDTO = z.infer<typeof EntryTicketVenueDTOSchema>

export const EntryTicketConcertDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  venue: EntryTicketVenueDTOSchema.nullable().optional(),
  slug: z.string().nullable(),
})
export type EntryTicketConcertDTO = z.infer<typeof EntryTicketConcertDTOSchema>

export const EntryTicketDTOSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: EntryTicketStatusDTOSchema,
  claimedAt: z.string().nullable(),
  scannedAt: z.string().nullable(),
  concert: EntryTicketConcertDTOSchema.nullable(),
})
export type EntryTicketDTO = z.infer<typeof EntryTicketDTOSchema>

export const EntryTicketPoolDTOSchema = z.object({
  capacity: z.number(),
  available: z.number(),
  claimed: z.number(),
  used: z.number(),
  cancelled: z.number(),
})
export type EntryTicketPoolDTO = z.infer<typeof EntryTicketPoolDTOSchema>

export const CreateEntryTicketsBodyDTOSchema = z.object({
  capacity: z.coerce.number().int().min(1).max(10000),
})
export type CreateEntryTicketsBodyDTO = z.infer<typeof CreateEntryTicketsBodyDTOSchema>

export const EntryTicketEventIdParamsDTOSchema = z.object({
  eventId: z.string(),
})
export type EntryTicketEventIdParamsDTO = z.infer<typeof EntryTicketEventIdParamsDTOSchema>

export const EntryTicketCodeParamsDTOSchema = z.object({
  code: z.string(),
})
export type EntryTicketCodeParamsDTO = z.infer<typeof EntryTicketCodeParamsDTOSchema>

export const EntryTicketIdParamsDTOSchema = z.object({
  id: z.string(),
})
export type EntryTicketIdParamsDTO = z.infer<typeof EntryTicketIdParamsDTOSchema>

export const EntryTicketSlugParamsDTOSchema = z.object({
  slug: z.string(),
})
export type EntryTicketSlugParamsDTO = z.infer<typeof EntryTicketSlugParamsDTOSchema>

export const EntryTicketListDTOSchema = z.array(EntryTicketDTOSchema)
export type EntryTicketListDTO = z.infer<typeof EntryTicketListDTOSchema>
