import { z } from 'zod'
import { CopyrightDTOSchema } from './copyright.dto'

export const ArtistDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbUrl: z.string().nullable(),
  thumbCopyright: CopyrightDTOSchema.nullable(),
})
export type ArtistDTO = z.infer<typeof ArtistDTOSchema>

/** Swell alert 미터 세 칸 — 큐레이터 판정. 구독 수로 산출하지 않는다. */
export const SwellTierDTOSchema = z.enum(['CALM', 'MID', 'BIG'])
export type SwellTierDTO = z.infer<typeof SwellTierDTOSchema>

/**
 * 이벤트 상세 라인업 한 팀. `ArtistDTO` 에 Swell 신호를 얹는다.
 * 전부 optional — 캐시된 옛 응답·신호 없는 팀은 필드가 빠진 채 온다.
 * `upcomingCount`·`nextDate` 는 **지금 보는 공연을 뺀** 예정 무대 기준.
 */
export const LineupArtistDTOSchema = ArtistDTOSchema.extend({
  nameKo: z.string().nullable().optional(),
  nameEn: z.string().nullable().optional(),
  swellTier: SwellTierDTOSchema.nullable().optional(),
  upcomingCount: z.number().int().min(0).optional(),
  nextDate: z.string().nullable().optional(),
})
export type LineupArtistDTO = z.infer<typeof LineupArtistDTOSchema>

export const GetArtistByIdParamsDTOSchema = z.object({
  id: z.string(),
})
export type GetArtistByIdParamsDTO = z.infer<typeof GetArtistByIdParamsDTOSchema>

export const GetConcertListByArtistIdParamsDTOSchema = z.object({
  artistId: z.string(),
})
export type GetConcertListByArtistIdParamsDTO = z.infer<
  typeof GetConcertListByArtistIdParamsDTOSchema
>

export const GetConcertListByArtistIdQueryStringDTOSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(0).default(0),
})
export type GetConcertListByArtistIdQueryStringDTO = z.infer<
  typeof GetConcertListByArtistIdQueryStringDTOSchema
>

export const GetArtistsByConcertIdParamsDTOSchema = z.object({
  concertId: z.string(),
})
export type GetArtistsByConcertIdParamsDTO = z.infer<typeof GetArtistsByConcertIdParamsDTOSchema>
