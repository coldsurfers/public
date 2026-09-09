import { z } from 'zod'

// 공급측이 이벤트/공연장 상세에서 직접 넣는 데이터 정정 요청 DTO.
// API 는 소문자 camelCase — prisma enum(VENUE_NAME…) 매핑은 라우트에서. subscription.dto 와 같은 규율.
// 정본: specs/web-next/data-correction-request.md

export const DataCorrectionFieldSchema = z.enum(['venueName', 'date', 'price', 'other'])
export type DataCorrectionField = z.infer<typeof DataCorrectionFieldSchema>

// ⚠️ concertId·venueId 는 **정확히 하나**만 채워진다. 둘 다 nullable 이라 DB 제약을 걸 수 없어
// 이 refine 이 유일한 게이트다.
export const CreateDataCorrectionRequestBodyDTOSchema = z
  .object({
    concertId: z.string().optional(),
    venueId: z.string().optional(),
    field: DataCorrectionFieldSchema,
    // 사람이 채우지 않는다 — 페이지가 갖고 있는 값을 폼이 자동으로 싣는다.
    currentValue: z.string().max(500).optional(),
    suggestedValue: z.string().max(500).optional(),
    message: z.string().min(1).max(2000),
    // 회신 전용. Contact 백본·마케팅 명단에 넣지 않는다(동의를 받은 적이 없다).
    contactEmail: z.string().email().optional(),
  })
  .refine((v) => Boolean(v.concertId) !== Boolean(v.venueId), {
    message: 'concertId 와 venueId 중 정확히 하나',
  })
export type CreateDataCorrectionRequestBodyDTO = z.infer<
  typeof CreateDataCorrectionRequestBodyDTOSchema
>
