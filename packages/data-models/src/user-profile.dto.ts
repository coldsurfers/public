import { z } from 'zod'
import { EventDTOSchema } from './event.dto'
import { UserHandleDTOSchema } from './user.dto'

export const UserProfileDTOSchema = z.object({
  handle: UserHandleDTOSchema,
  subscribedEvents: EventDTOSchema.array(),
  selfCreatedEvents: EventDTOSchema.array(),
})
export type UserProfileDTO = z.infer<typeof UserProfileDTOSchema>

export const GetUserProfileByHandleParamsDTOSchema = z.object({
  handle: UserHandleDTOSchema,
})
export type GetUserProfileByHandleParamsDTO = z.infer<typeof GetUserProfileByHandleParamsDTOSchema>

export const UpdateUserProfileByHandleBodyDTOSchema = z.object({
  handle: UserHandleDTOSchema.optional(),
})
export type UpdateUserProfileByHandleBodyDTO = z.infer<
  typeof UpdateUserProfileByHandleBodyDTOSchema
>

export const CheckHandleBodyDTOSchema = z.object({
  handle: UserHandleDTOSchema,
})
export type CheckHandleBodyDTO = z.infer<typeof CheckHandleBodyDTOSchema>

export const CheckHandleResponseDTOSchema = z.object({
  available: z.boolean(),
  reason: z.string().nullable(),
})
export type CheckHandleResponseDTO = z.infer<typeof CheckHandleResponseDTOSchema>
