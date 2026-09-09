import { z } from 'zod'
import { FeedDTOSchema, FeedEntityTypes } from './feed.dto'
import { CursorPaginationQueryStringDTOSchema } from './pagination.dto'

export const NotificationChannels = {
  IN_APP: 'IN_APP',
  EMAIL: 'EMAIL',
} as const

export const NotificationChannelSchema = z.nativeEnum(NotificationChannels)
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>

export const UserNotificationDTOSchema = z.object({
  id: z.string().uuid(),
  feedId: z.string().uuid(),
  channel: NotificationChannelSchema,
  isRead: z.boolean(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  feed: FeedDTOSchema,
})
export type UserNotificationDTO = z.infer<typeof UserNotificationDTOSchema>

export const UserNotificationListDTOSchema = z.object({
  items: UserNotificationDTOSchema.array(),
  nextCursor: z.string().nullable(),
})
export type UserNotificationListDTO = z.infer<typeof UserNotificationListDTOSchema>

export const UserNotificationUnreadCountDTOSchema = z.object({
  count: z.number().int().nonnegative(),
})
export type UserNotificationUnreadCountDTO = z.infer<typeof UserNotificationUnreadCountDTOSchema>

export const UserNotificationListQueryStringDTOSchema = CursorPaginationQueryStringDTOSchema.extend(
  {
    unread: z.union([z.literal('true'), z.literal('false')]).optional(),
    /**
     * 종류 필터 — 알림 지면의 카테고리 레일/칩이 거는 축(`Feed.entityType`).
     * 클라이언트에서 거르면 커서 페이지 안에서만 걸려 「공연 소식」을 골라도 다음 장에 더 남는다.
     */
    type: z.nativeEnum(FeedEntityTypes).optional(),
  },
)
export type UserNotificationListQueryStringDTO = z.infer<
  typeof UserNotificationListQueryStringDTOSchema
>

/**
 * 종류별 알림 수 — 카테고리 레일/칩의 숫자. `list` 는 커서 페이지네이션이라 전수 집계가
 * 아니고, 화면에서 세면 「받아온 만큼」만 나와 라벨이 거짓말을 한다. 그래서 별도 축이다.
 *
 * `byType` 은 `FeedEntityTypes` 전 종류를 **항상 채운다**(0 이면 0). 키가 빠지면 소비처가
 * `?? 0` 을 흩뿌리게 되고, 그 자리마다 「없음」과 「0건」이 구분되지 않는다.
 */
export const UserNotificationCountsDTOSchema = z.object({
  total: z.number().int().nonnegative(),
  byType: z.object({
    CONCERT_LIST: z.number().int().nonnegative(),
    APP_FEATURE: z.number().int().nonnegative(),
    EDITORIAL: z.number().int().nonnegative(),
    USER: z.number().int().nonnegative(),
    USER_POST: z.number().int().nonnegative(),
  }),
})
export type UserNotificationCountsDTO = z.infer<typeof UserNotificationCountsDTOSchema>

export const UserNotificationIdParamsDTOSchema = z.object({
  id: z.string().uuid(),
})
export type UserNotificationIdParamsDTO = z.infer<typeof UserNotificationIdParamsDTOSchema>
