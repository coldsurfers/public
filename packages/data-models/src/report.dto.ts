import { z } from 'zod'

// 신고 — 스팟 글 · 댓글 공통. 한 사람이 같은 대상을 한 번만 신고한다(다시 보내도 한 건).
// 서로 다른 3명이 처리 전 신고를 남기면 대상이 자동으로 숨겨진다 — 운영자가 「문제없음」으로 풀 수 있다.
// 정본: paul-rockstar #539

export const REPORT_TARGET_TYPES = ['AREA_POST', 'AREA_POST_COMMENT'] as const
export const ReportTargetTypeDTOSchema = z.enum(REPORT_TARGET_TYPES)
export type ReportTargetTypeDTO = z.infer<typeof ReportTargetTypeDTOSchema>

export const REPORT_REASONS = ['SPAM', 'ABUSE', 'PERSONAL_INFO', 'ILLEGAL', 'OTHER'] as const
export const ReportReasonDTOSchema = z.enum(REPORT_REASONS)
export type ReportReasonDTO = z.infer<typeof ReportReasonDTOSchema>

export const REPORT_NOTE_MAX_LENGTH = 500

export const CreateReportBodyDTOSchema = z.object({
  targetType: ReportTargetTypeDTOSchema,
  targetId: z.string().uuid(),
  reason: ReportReasonDTOSchema,
  note: z.string().trim().max(REPORT_NOTE_MAX_LENGTH).optional(),
})
export type CreateReportBodyDTO = z.infer<typeof CreateReportBodyDTOSchema>

export const ReportCreatedDTOSchema = z.object({
  id: z.string(),
})
export type ReportCreatedDTO = z.infer<typeof ReportCreatedDTOSchema>

// 운영자 신고 큐 — 대상 하나에 한 줄. 처리 전(PENDING) 신고가 남은 대상만
export const StaffReportTargetDTOSchema = z.object({
  targetType: ReportTargetTypeDTOSchema,
  targetId: z.string(),
  postId: z.string(),
  preview: z.string(),
  hidden: z.boolean(),
  reportCount: z.number().int(),
  reasons: ReportReasonDTOSchema.array(),
  notes: z.string().array(),
  firstReportedAt: z.string(),
})
export type StaffReportTargetDTO = z.infer<typeof StaffReportTargetDTOSchema>

export const StaffReportQueueDTOSchema = z.object({
  items: StaffReportTargetDTOSchema.array(),
})
export type StaffReportQueueDTO = z.infer<typeof StaffReportQueueDTOSchema>

export const StaffReportTargetParamsDTOSchema = z.object({
  targetType: ReportTargetTypeDTOSchema,
  targetId: z.string().uuid(),
})
export type StaffReportTargetParamsDTO = z.infer<typeof StaffReportTargetParamsDTOSchema>

// HIDE: 대상을 숨기고 신고를 HIDDEN 으로 닫는다 · DISMISS: 숨김을 풀고 신고를 DISMISSED 로 닫는다
export const ResolveReportsBodyDTOSchema = z.object({
  action: z.enum(['HIDE', 'DISMISS']),
})
export type ResolveReportsBodyDTO = z.infer<typeof ResolveReportsBodyDTOSchema>

export const ResolvedReportsDTOSchema = z.object({
  targetType: ReportTargetTypeDTOSchema,
  targetId: z.string(),
  hidden: z.boolean(),
  resolvedCount: z.number().int(),
})
export type ResolvedReportsDTO = z.infer<typeof ResolvedReportsDTOSchema>
