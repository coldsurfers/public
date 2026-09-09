import { z } from 'zod'

// 익명 캡처 구독 DTO — 로그인 없이 email 한 줄로 venue/event/daily 팔로우(피벗 캡처 유틸리티 Phase 1).
// 계정 기반 subscribe.dto(`UsersOnSubscribed*`) 와 별개 — 신원은 email + 익명 uuid(헤더).
// API 는 소문자 targetType('venue'|'event'|'daily') — prisma enum(VENUE|EVENT|DAILY) 매핑은 라우트에서.
// 정본: specs/web-next/audience-capture-phase1.md
//
// `daily` 만 성격이 다르다 — 가리킬 row 가 있는 대상이 아니라 **채널**이라 `targetId` 가
// 상수(`DAILY_TARGET_ID`)다. `@@unique([email, targetType, targetId])` 덕에 사람당 1행이 된다.

export const SubscriptionTargetTypeSchema = z.enum(['venue', 'event', 'daily'])

/** `/daily` 채널 구독의 고정 `targetId`. 편(slug)이 아니라 채널이다 — 편마다 행이 늘면 안 된다. */
export const DAILY_TARGET_ID = 'coldsurf-daily'
export type SubscriptionTargetType = z.infer<typeof SubscriptionTargetTypeSchema>

export const CreateSubscriptionBodyDTOSchema = z.object({
  email: z.string().email(),
  targetType: SubscriptionTargetTypeSchema,
  targetId: z.string().min(1),
  // double opt-in 동의 체크 — 미체크(false)도 row 는 남기되 verifiedAt=null 로 발송 대상 제외.
  consent: z.boolean(),
})
export type CreateSubscriptionBodyDTO = z.infer<typeof CreateSubscriptionBodyDTOSchema>

// 토글오프 — 익명 신원(`x-anonymous-user-id` 헤더)으로만 삭제. email 은 받지 않는다.
export const DeleteSubscriptionBodyDTOSchema = z.object({
  targetType: SubscriptionTargetTypeSchema,
  targetId: z.string().min(1),
})
export type DeleteSubscriptionBodyDTO = z.infer<typeof DeleteSubscriptionBodyDTOSchema>

export const SubscriptionDTOSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  targetType: SubscriptionTargetTypeSchema,
  targetId: z.string(),
  consent: z.boolean(),
  createdAt: z.string(),
})
export type SubscriptionDTO = z.infer<typeof SubscriptionDTOSchema>

export const DeleteSubscriptionResultDTOSchema = z.object({
  ok: z.literal(true),
})
export type DeleteSubscriptionResultDTO = z.infer<typeof DeleteSubscriptionResultDTOSchema>
