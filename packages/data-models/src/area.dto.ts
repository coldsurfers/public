import { z } from 'zod'
import { EventDTOSchema } from './event.dto'
import { VenueDTOSchema } from './venue.dto'

// 동네(권역) DTO — 사람이 묶는 단위(대학로·홍대). 경계는 폴리곤이 아니라 소속 공연장의 묶음이다.
// 「내 동네」는 로그인 계정에만 붙는다 — 익명 subscription.dto 와 별개.
// 정본: paul-rockstar specs/billets-server/area-domain.md

export const AreaDTOSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string().nullable(),
  upcomingEventCount: z.number().int(),
})
export type AreaDTO = z.infer<typeof AreaDTOSchema>

// 상세 — 공연은 **날짜순 원본만** 싣는다. 「오늘·이번 주」 묶음은 클라이언트가 KST 로 한다.
// venues 는 예정 공연이 있는 공연장만.
export const AreaDetailDTOSchema = AreaDTOSchema.extend({
  venues: VenueDTOSchema.array(),
  upcomingEvents: EventDTOSchema.array(),
})
export type AreaDetailDTO = z.infer<typeof AreaDetailDTOSchema>

export const GetAreaBySlugParamsDTOSchema = z.object({
  slug: z.string(),
})
export type GetAreaBySlugParamsDTO = z.infer<typeof GetAreaBySlugParamsDTOSchema>

// 내 동네 — 하나만. 없으면 area: null
export const MyAreaDTOSchema = z.object({
  area: AreaDTOSchema.nullable(),
})
export type MyAreaDTO = z.infer<typeof MyAreaDTOSchema>

export const PutMyAreaBodyDTOSchema = z.object({
  areaId: z.string().min(1),
})
export type PutMyAreaBodyDTO = z.infer<typeof PutMyAreaBodyDTOSchema>

// 목록 밖 동네 요청 — 자유 입력. 좌표는 위치 권한을 줬을 때만
export const CreateAreaRequestBodyDTOSchema = z.object({
  text: z.string().trim().min(1).max(50),
  lat: z.number().optional(),
  lng: z.number().optional(),
})
export type CreateAreaRequestBodyDTO = z.infer<typeof CreateAreaRequestBodyDTOSchema>
