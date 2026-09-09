import { z } from 'zod'

// 도메인-중립 댓글 DTO. threadKey 컨벤션 `<scope>:<id>` 또는 `<host>:<scope>:<id>` —
// consumer 가 자기 도메인 식별자를 임베드. 첫 사용처는 paul-rockstar 매거진
// (comments-internalize Phase B), 이후 billets event · coldsurf-io venue 등 확장.
//
// 알려진 scope:
//   - pick:<slug>             — paul-rockstar pick
//   - essay:<slug>            — paul-rockstar essay
//   - field-notes:<id>        — paul-rockstar field notes
//   - event:<concertId>       — coldsurf-io · billets-app 공연 상세 (event-review-to-comment-pivot)
//   - coldsurf-io:venue:<id>  — coldsurf-io 베뉴 (예정)

export const COMMENT_BODY_MIN_LENGTH = 1
export const COMMENT_BODY_MAX_LENGTH = 800
// threadKey 폭주 방지. 컨벤션상 100자도 넘기 어려움.
export const COMMENT_THREAD_KEY_MAX_LENGTH = 200

export const CommentAuthorDTOSchema = z.object({
  id: z.string(),
  handle: z.string().nullable(),
})
export type CommentAuthorDTO = z.infer<typeof CommentAuthorDTOSchema>

export const CommentDTOSchema = z.object({
  id: z.string().uuid(),
  threadKey: z.string().min(1).max(COMMENT_THREAD_KEY_MAX_LENGTH),
  body: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: CommentAuthorDTOSchema,
})
export type CommentDTO = z.infer<typeof CommentDTOSchema>

export const CommentListDTOSchema = z.object({
  items: z.array(CommentDTOSchema),
  nextCursor: z.string().nullable(),
})
export type CommentListDTO = z.infer<typeof CommentListDTOSchema>

export const CommentIdParamsDTOSchema = z.object({
  commentId: z.string().uuid(),
})
export type CommentIdParamsDTO = z.infer<typeof CommentIdParamsDTOSchema>

export const GetCommentsQueryStringDTOSchema = z.object({
  threadKey: z.string().min(1).max(COMMENT_THREAD_KEY_MAX_LENGTH),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})
export type GetCommentsQueryStringDTO = z.infer<typeof GetCommentsQueryStringDTOSchema>

// trim 후 1~800 자 — 공백-only body (`"   "`) 차단. trim 결과를 그대로 저장.
const commentBody = () =>
  z.string().trim().min(COMMENT_BODY_MIN_LENGTH).max(COMMENT_BODY_MAX_LENGTH)

const commentBodyShape = () => ({
  threadKey: z.string().min(1).max(COMMENT_THREAD_KEY_MAX_LENGTH),
  body: commentBody(),
})

export const CreateCommentBodyDTOSchema = z.object(commentBodyShape())
export type CreateCommentBodyDTO = z.infer<typeof CreateCommentBodyDTOSchema>

// Update 는 body 만 변경 — threadKey 이동 불가.
export const UpdateCommentBodyDTOSchema = z.object({
  body: commentBody(),
})
export type UpdateCommentBodyDTO = z.infer<typeof UpdateCommentBodyDTOSchema>
