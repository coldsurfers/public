import { z } from 'zod'

export const LatLngDTOSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})
export type LatLngDTO = z.infer<typeof LatLngDTOSchema>
