import { z } from 'zod'

export const SearchDTOSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('artist'),
    name: z.string(),
    // 아티스트 대부분은 ArtistProfileImage 가 없다 (743명 중 697명, 2026-08-20 실측).
    // non-nullable 이면 소비자의 행 단위 safeParse 가 그들을 통째로 버려 검색 결과에서 사라진다.
    profileImgUrl: z.string().nullable(),
    id: z.string(),
  }),
  z.object({
    type: z.literal('venue'),
    name: z.string(),
    id: z.string(),
    slug: z.string().nullable(),
    address: z.string().optional(),
  }),
  z.object({
    type: z.literal('concert'),
    title: z.string(),
    thumbnailImgUrl: z.string(),
    // 실제 값은 2025-10-18T09:00:00+00:00 과 같은 값 -> coerce date로 변환하면 2025-10-18T09:00:00Z 로 변환됨
    // strict하게 z.string().datetime()으로 하면 zodError
    date: z.coerce.date(),
    venueTitle: z.string(),
    id: z.string(),
    slug: z.string().nullable(),
    locationCityId: z.string(),
  }),
])
export type SearchDTO = z.infer<typeof SearchDTOSchema>

export const SearchListQueryStringDTOSchema = z.object({
  keyword: z.string(),
  type: z.enum(['artist', 'venue', 'concert']).optional(),
})
export type SearchListQueryStringDTO = z.infer<typeof SearchListQueryStringDTOSchema>
