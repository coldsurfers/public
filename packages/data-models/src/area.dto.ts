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

// 스팟 요약 — **원본 값만** 싣는다. 비중(%)과 「잔잔 · 보통 · 큰 파도」 단계는 표면이 정한다
// (/v1/forecast 와 같은 원칙 — 표시를 바꿀 때 서버를 다시 배포하지 않게).
// categories: 앞으로 30일 예정 공연의 카테고리별 건수, 많은 순
// swell: 오늘부터 7일 건수 · 지난 8주 주평균 · 그 비율(평균이 0 이면 null)
export const AreaStatsDTOSchema = z.object({
  neighborCount: z.number().int(),
  categories: z.object({ name: z.string(), count: z.number().int() }).array(),
  swell: z.object({
    count: z.number().int(),
    baseline: z.number(),
    ratio: z.number().nullable(),
  }),
})
export type AreaStatsDTO = z.infer<typeof AreaStatsDTOSchema>

// 스팟 목록 한 칸
export const AreaWithStatsDTOSchema = AreaDTOSchema.extend({
  stats: AreaStatsDTOSchema,
})
export type AreaWithStatsDTO = z.infer<typeof AreaWithStatsDTOSchema>

// 상세 — 공연은 **날짜순 원본만** 싣는다. 「오늘·이번 주」 묶음은 클라이언트가 KST 로 한다.
// venues 는 예정 공연이 있는 공연장만.
export const AreaDetailDTOSchema = AreaWithStatsDTOSchema.extend({
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

// 이웃 — 여러 스팟. 대표 스팟(primaryAreaId)은 「내 동네」(MyAreaDTO)와 같은 값이다
export const MyNeighborsDTOSchema = z.object({
  areas: AreaDTOSchema.array(),
  primaryAreaId: z.string().nullable(),
})
export type MyNeighborsDTO = z.infer<typeof MyNeighborsDTOSchema>

export const NeighborAreaParamsDTOSchema = z.object({
  areaId: z.string().min(1),
})
export type NeighborAreaParamsDTO = z.infer<typeof NeighborAreaParamsDTOSchema>

// 목록 밖 동네 요청 — 자유 입력. 좌표는 위치 권한을 줬을 때만
export const CreateAreaRequestBodyDTOSchema = z.object({
  text: z.string().trim().min(1).max(50),
  lat: z.number().optional(),
  lng: z.number().optional(),
})
export type CreateAreaRequestBodyDTO = z.infer<typeof CreateAreaRequestBodyDTOSchema>
