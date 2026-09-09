import { z } from 'zod'

const UserPreference = {
  NOTICE_EMAIL: 'NOTICE_EMAIL',
  NEW_SHOWS_NOTIFICATION_EMAIL: 'NEW_SHOWS_NOTIFICATION_EMAIL',
  IN_APP_NEW_SHOWS_NOTIFICATION: 'IN_APP_NEW_SHOWS_NOTIFICATION',
  APP_FEATURE_NOTIFICATION_EMAIL: 'APP_FEATURE_NOTIFICATION_EMAIL',
  IN_APP_APP_FEATURE_NOTIFICATION: 'IN_APP_APP_FEATURE_NOTIFICATION',
} as const

const UserPreferenceSource = {
  SIGN_UP: 'SIGN_UP',
  SETTINGS: 'SETTINGS',
} as const

export const UserPreferenceDTOSchema = z.object({
  preference: z.nativeEnum(UserPreference),
  enabled: z.boolean(),
  agreedAt: z.date().nullable(),
  source: z.nativeEnum(UserPreferenceSource).nullable(),
})
export type UserPreferenceDTO = z.infer<typeof UserPreferenceDTOSchema>

// PATCH body — `Partial<Record<UserPreference, …>>`. zod 4 의 `z.record(nativeEnum, …)` 는
// enum 의 *모든* key 를 required 로 처리해 한 칸만 토글하는 정상 PATCH 가 400 으로 떨어진다
// (apps/coldsurf-io · paul-rockstar/web-next 양쪽에서 재현). 키별 `.optional()` 형태로 명시해
// 진짜 partial 로 만든다.
const UserPreferenceItemSchema = z.object({
  enabled: z.boolean(),
  source: z.nativeEnum(UserPreferenceSource).nullable(),
})

export const UpdateUserPreferencesBodyDTOSchema = z.object({
  NOTICE_EMAIL: UserPreferenceItemSchema.optional(),
  NEW_SHOWS_NOTIFICATION_EMAIL: UserPreferenceItemSchema.optional(),
  IN_APP_NEW_SHOWS_NOTIFICATION: UserPreferenceItemSchema.optional(),
  APP_FEATURE_NOTIFICATION_EMAIL: UserPreferenceItemSchema.optional(),
  IN_APP_APP_FEATURE_NOTIFICATION: UserPreferenceItemSchema.optional(),
})
export type UpdateUserPreferencesBodyDTO = z.infer<typeof UpdateUserPreferencesBodyDTOSchema>
