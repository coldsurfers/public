import { z } from 'zod'
import { PriceDTOSchema } from './price.dto'

export const TicketDTOSchema = z.object({
  id: z.string(),
  sellerName: z.string(),
  url: z.string(),
  openDate: z.string().datetime(),
  prices: PriceDTOSchema.array(),
})
export type TicketDTO = z.infer<typeof TicketDTOSchema>

export const GetTicketsByEventIdQueryStringDTOSchema = z.object({
  eventId: z.string(),
})
export type GetTicketsByEventIdQueryStringDTO = z.infer<
  typeof GetTicketsByEventIdQueryStringDTOSchema
>

export const TicketPromotionDTOSchema = TicketDTOSchema.omit({
  prices: true,
}).extend({
  price: PriceDTOSchema.nullable(),
})
export type TicketPromotionDTO = z.infer<typeof TicketPromotionDTOSchema>

export const CreateTicketBodyDTOSchema = TicketDTOSchema.omit({
  id: true,
  openDate: true,
  prices: true,
})
export type CreateTicketBodyDTO = z.infer<typeof CreateTicketBodyDTOSchema>

export const DeleteTicketParamsDTOSchema = z.object({
  ticketId: z.string(),
})
export type DeleteTicketParamsDTO = z.infer<typeof DeleteTicketParamsDTOSchema>

export const DeleteTicketBodyDTOSchema = z.object({
  eventId: z.string(),
})
export type DeleteTicketBodyDTO = z.infer<typeof DeleteTicketBodyDTOSchema>
