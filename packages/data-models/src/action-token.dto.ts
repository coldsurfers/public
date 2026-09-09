import { z } from 'zod'

export const ActionTokenQuerystringDTOSchema = z.object({
  actionToken: z.string(),
})
export type ActionTokenQuerystringDTO = z.infer<typeof ActionTokenQuerystringDTOSchema>
