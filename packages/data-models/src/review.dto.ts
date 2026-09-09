import { z } from 'zod'

export const REVIEW_RATING_MIN = 1
export const REVIEW_RATING_MAX = 5
export const REVIEW_BODY_MIN_LENGTH = 10
export const REVIEW_BODY_MAX_LENGTH = 1000

export const ReviewSortDTOSchema = z.enum(['latest', 'highest', 'lowest'])
export type ReviewSortDTO = z.infer<typeof ReviewSortDTOSchema>

export const ReviewAuthorDTOSchema = z.object({
  id: z.string(),
  handle: z.string().nullable(),
})
export type ReviewAuthorDTO = z.infer<typeof ReviewAuthorDTOSchema>

export const ReviewDTOSchema = z.object({
  id: z.string().uuid(),
  concertId: z.string().uuid(),
  rating: z.number().int().min(REVIEW_RATING_MIN).max(REVIEW_RATING_MAX),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: ReviewAuthorDTOSchema,
})
export type ReviewDTO = z.infer<typeof ReviewDTOSchema>

export const ReviewSummaryDTOSchema = z.object({
  averageRating: z.number(),
  totalCount: z.number().int(),
  ratingDistribution: z.object({
    1: z.number().int(),
    2: z.number().int(),
    3: z.number().int(),
    4: z.number().int(),
    5: z.number().int(),
  }),
})
export type ReviewSummaryDTO = z.infer<typeof ReviewSummaryDTOSchema>

export const ReviewListDTOSchema = z.object({
  items: z.array(ReviewDTOSchema),
  nextCursor: z.string().nullable(),
})
export type ReviewListDTO = z.infer<typeof ReviewListDTOSchema>

export const MyReviewDTOSchema = z.object({
  review: ReviewDTOSchema.nullable(),
})
export type MyReviewDTO = z.infer<typeof MyReviewDTOSchema>

export const ReviewConcertIdParamsDTOSchema = z.object({
  concertId: z.string().uuid(),
})
export type ReviewConcertIdParamsDTO = z.infer<typeof ReviewConcertIdParamsDTOSchema>

export const ReviewIdParamsDTOSchema = z.object({
  reviewId: z.string().uuid(),
})
export type ReviewIdParamsDTO = z.infer<typeof ReviewIdParamsDTOSchema>

export const GetReviewsQueryStringDTOSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: ReviewSortDTOSchema.optional(),
})
export type GetReviewsQueryStringDTO = z.infer<typeof GetReviewsQueryStringDTOSchema>

const reviewBodyShape = () => ({
  rating: z.number().int().min(REVIEW_RATING_MIN).max(REVIEW_RATING_MAX),
  body: z.string().min(REVIEW_BODY_MIN_LENGTH).max(REVIEW_BODY_MAX_LENGTH),
})

export const ReviewBodyDTOSchema = z.object(reviewBodyShape())
export type ReviewBodyDTO = z.infer<typeof ReviewBodyDTOSchema>

// Create/Update share the same shape today but are kept as distinct schemas so
// they can be registered under separate OpenAPI component ids (and diverge later).
export const CreateReviewBodyDTOSchema = z.object(reviewBodyShape())
export type CreateReviewBodyDTO = z.infer<typeof CreateReviewBodyDTOSchema>

export const UpdateReviewBodyDTOSchema = z.object(reviewBodyShape())
export type UpdateReviewBodyDTO = z.infer<typeof UpdateReviewBodyDTOSchema>
