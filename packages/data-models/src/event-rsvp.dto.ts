import { z } from 'zod'
import { ConcertDTOSchema } from './concert.dto'

const ConcertRsvpEmoji = {
  BURNING: 'BURNING',
  CONFETTI: 'CONFETTI',
  HEART: 'HEART',
  PARTY: 'PARTY',
  PRAY: 'PRAY',
  ROCKET: 'ROCKET',
  SAD: 'SAD',
  BROKEN_HEART: 'BROKEN_HEART',
  SMILE: 'SMILE',
  GOING: 'GOING',
  MAYBE: 'MAYBE',
  NOT_GOING: 'NOT_GOING',
} as const

export const EventRsvpEmojiDTOSchema = z.nativeEnum(ConcertRsvpEmoji)
export type EventRsvpEmojiDTO = z.infer<typeof EventRsvpEmojiDTOSchema>

export const EventRsvpParticipateEmojisDTOSchema = z.enum([
  ConcertRsvpEmoji.GOING,
  ConcertRsvpEmoji.MAYBE,
  ConcertRsvpEmoji.NOT_GOING,
])
export type EventRsvpParticipateEmojisDTO = z.infer<typeof EventRsvpParticipateEmojisDTOSchema>

export const EventRsvpCountsWithMeDTOSchema = z.record(
  EventRsvpEmojiDTOSchema,
  z.object({
    count: z.number(),
    me: z.boolean(),
  }),
)
export type EventRsvpCountsWithMeDTO = z.infer<typeof EventRsvpCountsWithMeDTOSchema>

export const EventRsvpEventIdParamsDTOSchema = z.object({
  eventId: z.string().uuid(),
})
export type EventRsvpEventIdParamsDTO = z.infer<typeof EventRsvpEventIdParamsDTOSchema>

export const EventRsvpUpdateActionDTOSchema = z.object({
  emoji: EventRsvpEmojiDTOSchema,
  action: z.enum(['TOGGLE']),
})
export type EventRsvpUpdateActionDTO = z.infer<typeof EventRsvpUpdateActionDTOSchema>

export const EventRsvpDTOSchema = ConcertDTOSchema.extend({
  interestedCount: z.number(),
})
export type EventRsvpDTO = z.infer<typeof EventRsvpDTOSchema>
