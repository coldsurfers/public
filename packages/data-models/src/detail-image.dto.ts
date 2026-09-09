import { z } from 'zod'

export const DetailImageDTOSchema = z.object({
  id: z.string(),
  url: z.string(),
  serialNumber: z.number().nullable(),
})
export type DetailImageDTO = z.infer<typeof DetailImageDTOSchema>

export const CreateDetailImageBodyDTOSchema = z.object({
  keyId: z.string(),
  serialNumber: z.number(),
})
export type CreateDetailImageBodyDTO = z.infer<typeof CreateDetailImageBodyDTOSchema>

export const DeleteDetailImageParamsDTOSchema = z.object({
  detailImageId: z.string().uuid(),
})
export type DeleteDetailImageParamsDTO = z.infer<typeof DeleteDetailImageParamsDTOSchema>

export const DeleteDetailImageBodyDTOSchema = z.object({
  concertId: z.string().uuid(),
})
export type DeleteDetailImageBodyDTO = z.infer<typeof DeleteDetailImageBodyDTOSchema>
