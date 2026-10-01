import { z } from 'zod'

// 스팟 열기 — 이름 · 한 줄로 제안하고 이웃이 모인다. 문턱에 닿으면 「준비 완료」가 되고,
// 운영자가 slug 를 정해 연다(공연장 매핑은 사람이 SQL 로). 같은 도시 · 같은 이름이면 새로 만들지 않고 합류한다.
// 정본: paul-rockstar #539

export const AREA_PROPOSAL_OPEN_THRESHOLD = 50
export const AREA_PROPOSAL_NAME_MAX_LENGTH = 20
export const AREA_PROPOSAL_TAGLINE_MAX_LENGTH = 40

export const AreaProposalDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  tagline: z.string().nullable(),
  cityName: z.string(),
  memberCount: z.number().int(),
  joinedByMe: z.boolean(),
  ready: z.boolean(),
  createdAt: z.string(),
})
export type AreaProposalDTO = z.infer<typeof AreaProposalDTOSchema>

export const AreaProposalListDTOSchema = z.object({
  items: AreaProposalDTOSchema.array(),
  threshold: z.number().int(),
})
export type AreaProposalListDTO = z.infer<typeof AreaProposalListDTOSchema>

export const CreateAreaProposalBodyDTOSchema = z.object({
  name: z.string().trim().min(1).max(AREA_PROPOSAL_NAME_MAX_LENGTH),
  tagline: z.string().trim().max(AREA_PROPOSAL_TAGLINE_MAX_LENGTH).optional(),
  cityName: z.string().trim().min(1).default('seoul'),
})
export type CreateAreaProposalBodyDTO = z.infer<typeof CreateAreaProposalBodyDTOSchema>

export const AreaProposalIdParamsDTOSchema = z.object({
  proposalId: z.string().uuid(),
})
export type AreaProposalIdParamsDTO = z.infer<typeof AreaProposalIdParamsDTOSchema>

export const AreaProposalMembershipDTOSchema = z.object({
  memberCount: z.number().int(),
  joinedByMe: z.boolean(),
})
export type AreaProposalMembershipDTO = z.infer<typeof AreaProposalMembershipDTOSchema>

// 운영자가 열 때 정하는 slug — 로마자(`daehakro` 와 같은 식별자)
export const OpenAreaProposalBodyDTOSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .min(2)
    .max(40),
})
export type OpenAreaProposalBodyDTO = z.infer<typeof OpenAreaProposalBodyDTOSchema>
