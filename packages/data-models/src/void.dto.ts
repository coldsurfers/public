import { z } from 'zod'

export const VoidDTOSchema = z.void()
export type VoidDTO = z.infer<typeof VoidDTOSchema>
