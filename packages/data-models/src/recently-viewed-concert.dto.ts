import { z } from 'zod'

export const RecentlyViewedConcertDTOSchema = z.object({
  id: z.string().uuid(),
  concertId: z.string().uuid(),
  anonymousUserId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
})

export type RecentlyViewedConcertDTO = z.infer<typeof RecentlyViewedConcertDTOSchema>
