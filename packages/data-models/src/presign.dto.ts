import { z } from 'zod'
import { UploadImageBodyDTOSchema } from './image.dto'

export const PresignFileDataDTOSchema = z.object({
  filename: z.string(),
  filetype: z.string(),
})
export type PresignFileDataDTO = z.infer<typeof PresignFileDataDTOSchema>

export const PresignedPostDTOSchema = z.object({
  url: z.string(),
  fields: z.record(z.string(), z.string()),
})
export type PresignedPostDTO = z.infer<typeof PresignedPostDTOSchema>

export const PresignPostBodyDTOSchema = UploadImageBodyDTOSchema.pick({
  concertId: true,
  resolution: true,
  type: true,
})
export type PresignPostBodyDTO = z.infer<typeof PresignPostBodyDTOSchema>
