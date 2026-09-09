import { z } from 'zod'

export const PosterDTOSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
})
export type PosterDTO = z.infer<typeof PosterDTOSchema>

export const GetPostersByEventIdQueryStringDTOSchema = z.object({
  eventId: z.string(),
})
export type GetPostersByEventIdQueryStringDTO = z.infer<
  typeof GetPostersByEventIdQueryStringDTOSchema
>

export const DeletePosterParamsDTOSchema = z.object({
  posterId: z.string().uuid(),
})
export type DeletePosterParamsDTO = z.infer<typeof DeletePosterParamsDTOSchema>

export const DeletePosterBodyDTOSchema = z.object({
  concertId: z.string().uuid(),
})
export type DeletePosterBodyDTO = z.infer<typeof DeletePosterBodyDTOSchema>
