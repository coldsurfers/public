import { z } from 'zod'
import { UserHandleDTOSchema } from './user.dto'

const SocialPlatformDTOSchema = z.union([
  z.literal('instagram'),
  z.literal('x'),
  z.literal('youtube'),
])

export const UserSocialLinkDTOSchema = z.object({
  id: z.string(),
  platform: SocialPlatformDTOSchema,
  platformUniqueId: z.string(),
  createdAt: z.date(),
})
export type UserSocialLinkDTO = z.infer<typeof UserSocialLinkDTOSchema>

export const UpdateUserSocialLinksBodyDTOSchema = z
  .object({
    platform: SocialPlatformDTOSchema,
    platformUniqueId: z.string(),
  })
  .array()
export type UpdateUserSocialLinksBodyDTO = z.infer<typeof UpdateUserSocialLinksBodyDTOSchema>

export const GetUserSocialLinksParamsDTOSchema = z.object({
  handle: UserHandleDTOSchema,
})
export type GetUserSocialLinksParamsDTO = z.infer<typeof GetUserSocialLinksParamsDTOSchema>
