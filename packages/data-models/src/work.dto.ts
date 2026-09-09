import { z } from 'zod'

// 작품(Work) 의 *참조* 골격 — SNS 홈 피드 포스트가 가리키는 readonly 부분만.
// 완전한 entity (description·history·gallery) 는 web-critique/work-entity → web-work-first-class
// 쪽 Work 모델이 담당한다. 여기서는 피드 카드가 보여줄 최소 식별·표기 필드만 동결한다.
//
// `WorkRef.id` 는 두 surface (홈 피드 · billets `/feed` 아카이브) 가 *공유하는 식별자* — 동일
// 작품을 양쪽이 가리킬 수 있게 한 약속.

export const WorkCategories = {
  Films: 'Films',
  Albums: 'Albums',
  Tracks: 'Tracks',
  Concerts: 'Concerts',
  Books: 'Books',
} as const
export const WorkCategorySchema = z.nativeEnum(WorkCategories)
export type WorkCategory = z.infer<typeof WorkCategorySchema>

export const WorkRefSchema = z.object({
  id: z.string(),
  category: WorkCategorySchema,
  title: z.string(),
  /** "David Fincher · 1999" — 자유 문자열. */
  credit: z.string(),
  cover: z
    .object({
      url: z.string(),
      palette: z.string().optional(),
    })
    .optional(),
})
export type WorkRef = z.infer<typeof WorkRefSchema>
