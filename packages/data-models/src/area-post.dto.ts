import { z } from 'zod'
import { COMMENT_BODY_MAX_LENGTH, CommentAuthorDTOSchema } from './comment.dto'

// 스팟 글 · 댓글 · 공감 — 스팟(Area) 하나가 이웃이 모여 이야기하는 자리다.
// 글 · 댓글은 그 스팟의 이웃만 쓰고, 공감은 로그인한 누구나 한다. 수정은 없고 삭제만 있다.
// 정본: paul-rockstar #539

export const AREA_POST_FLAIRS = ['REVIEW', 'QUESTION', 'TOGETHER', 'TIP', 'CHAT'] as const
export const AreaPostFlairDTOSchema = z.enum(AREA_POST_FLAIRS)
export type AreaPostFlairDTO = z.infer<typeof AreaPostFlairDTOSchema>

export const AREA_POST_TITLE_MAX_LENGTH = 100
export const AREA_POST_BODY_MAX_LENGTH = 4000

export const AreaPostDTOSchema = z.object({
  id: z.string(),
  areaId: z.string(),
  flair: AreaPostFlairDTOSchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  author: CommentAuthorDTOSchema,
  concert: z.object({ id: z.string(), slug: z.string().nullable(), title: z.string() }).nullable(),
  venue: z.object({ id: z.string(), slug: z.string().nullable(), name: z.string() }).nullable(),
  likeCount: z.number().int(),
  commentCount: z.number().int(),
  likedByMe: z.boolean(),
})
export type AreaPostDTO = z.infer<typeof AreaPostDTOSchema>

export const AreaPostListDTOSchema = z.object({
  items: AreaPostDTOSchema.array(),
  nextCursor: z.string().nullable(),
})
export type AreaPostListDTO = z.infer<typeof AreaPostListDTOSchema>

// popular: 최근 7일 글 중 공감 많은 순 · latest: 최신순. cursor 는 서버가 준 값을 그대로 돌려준다
export const GetAreaPostsQueryDTOSchema = z.object({
  sort: z.enum(['popular', 'latest']).default('latest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
export type GetAreaPostsQueryDTO = z.infer<typeof GetAreaPostsQueryDTOSchema>

export const CreateAreaPostBodyDTOSchema = z.object({
  flair: AreaPostFlairDTOSchema,
  title: z.string().trim().min(1).max(AREA_POST_TITLE_MAX_LENGTH),
  body: z.string().trim().min(1).max(AREA_POST_BODY_MAX_LENGTH),
  concertId: z.string().uuid().optional(),
  venueId: z.string().uuid().optional(),
})
export type CreateAreaPostBodyDTO = z.infer<typeof CreateAreaPostBodyDTOSchema>

export const AreaPostIdParamsDTOSchema = z.object({
  postId: z.string().uuid(),
})
export type AreaPostIdParamsDTO = z.infer<typeof AreaPostIdParamsDTOSchema>

export const AreaPostLikeDTOSchema = z.object({
  likeCount: z.number().int(),
  likedByMe: z.boolean(),
})
export type AreaPostLikeDTO = z.infer<typeof AreaPostLikeDTOSchema>

// 댓글 — 대댓글은 1단(parentId 의 parent 는 null). 지운 · 숨긴 댓글은 싣지 않는다
export const AreaPostCommentDTOSchema = z.object({
  id: z.string(),
  postId: z.string(),
  parentId: z.string().nullable(),
  body: z.string(),
  createdAt: z.string(),
  author: CommentAuthorDTOSchema,
})
export type AreaPostCommentDTO = z.infer<typeof AreaPostCommentDTOSchema>

export const AreaPostCommentListDTOSchema = z.object({
  items: AreaPostCommentDTOSchema.array(),
})
export type AreaPostCommentListDTO = z.infer<typeof AreaPostCommentListDTOSchema>

export const CreateAreaPostCommentBodyDTOSchema = z.object({
  body: z.string().trim().min(1).max(COMMENT_BODY_MAX_LENGTH),
  parentId: z.string().uuid().optional(),
})
export type CreateAreaPostCommentBodyDTO = z.infer<typeof CreateAreaPostCommentBodyDTOSchema>

export const AreaPostCommentIdParamsDTOSchema = z.object({
  commentId: z.string().uuid(),
})
export type AreaPostCommentIdParamsDTO = z.infer<typeof AreaPostCommentIdParamsDTOSchema>
