import { z } from 'zod'

export const OffsetPaginationDTOSchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(0).max(100).default(20),
})
export type OffsetPaginationDTO = z.infer<typeof OffsetPaginationDTOSchema>

export const CursorPaginationQueryStringDTOSchema = z.object({
  // z.union([z.literal('next'), z.literal('prev')]) 와 타입·런타임 검증은 동일하지만,
  // OpenAPI 직렬화가 anyOf 가 아닌 단일 enum 으로 떨어져 Swagger UI 가 드롭다운으로
  // 렌더링·제출한다(union 은 free-text 로 렌더돼 값이 바인딩 안 됨).
  direction: z.enum(['next', 'prev']),
  cursor: z.string().optional(),
  size: z.coerce.number().int().min(0).max(100).optional(),
})
export type CursorPaginationQueryStringDTO = z.infer<typeof CursorPaginationQueryStringDTOSchema>

export const createCursorPaginationDTOSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    prevCursor: z.string().nullable(),
  })
export type CursorPaginationDTO<T> = {
  data: T[]
  nextCursor: string | null
  prevCursor: string | null
}

export const CursorPaginationWithLocationCityDTOSchema = z.object({
  locationCityName: z.string(),
  cursorPagination: CursorPaginationQueryStringDTOSchema,
})
export type CursorPaginationWithLocationCityDTO = z.infer<
  typeof CursorPaginationWithLocationCityDTOSchema
>

export const CursorPaginationWithGeohashDTOSchema = z.object({
  geohash: z.string(),
  cursorPagination: CursorPaginationQueryStringDTOSchema,
})
export type CursorPaginationWithGeohashDTO = z.infer<typeof CursorPaginationWithGeohashDTOSchema>
