import { z } from 'zod'

export const SurveyColdsurfTicketDTOSchema = z.object({
  type: z.literal('COLDSURF_TICKET'),
  counters: z.object({
    GOOD: z.number().optional(),
    MAYBE: z.number().optional(),
    BAD: z.number().optional(),
  }),
})
export type SurveyColdsurfTicketDTO = z.infer<typeof SurveyColdsurfTicketDTOSchema>

export const SurveyDTOSchema = z.discriminatedUnion('type', [SurveyColdsurfTicketDTOSchema])
export type SurveyDTO = z.infer<typeof SurveyDTOSchema>

export const SurveyActionColdsurfTicketDTOSchema = z.object({
  type: z.literal('COLDSURF_TICKET'),
  action: z.enum(['GOOD', 'MAYBE', 'BAD']),
})
export type SurveyActionColdsurfTicketDTO = z.infer<typeof SurveyActionColdsurfTicketDTOSchema>
