import { z } from 'zod'

export const NewsletterUserDTOSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  unsubscribedAt: z.string().nullable(),
})
export type NewsletterUserDTO = z.infer<typeof NewsletterUserDTOSchema>

export const NewsletterListDTOSchema = z.enum(['COLDSURF', 'PAUL_ROCKSTAR'])
export type NewsletterListDTO = z.infer<typeof NewsletterListDTOSchema>

export const NewsletterSubscribeBodyDTOSchema = z.object({
  email: z.string().email(),
  termsVersionId: z.string().uuid(),
  // 기존 클라이언트 호환을 위해 optional. 미지정 시 서버에서 COLDSURF 로 폴백한다.
  list: NewsletterListDTOSchema.optional(),
})
export type NewsletterSubscribeBodyDTO = z.infer<typeof NewsletterSubscribeBodyDTOSchema>

// paul-rockstar 의 최신 발행 호 공개 메타. `apps/web/scripts/generate-issues-meta.ts` 가 빌드 타임에
// `/api/issues/latest.json` 으로 내보내는 정적 JSON 의 shape (SSOT). billets-server(가입-시점 발송)와
// mailer-cli(broadcast)가 같은 스키마로 *런타임 검증* 해 소비한다.
export const PaulRockstarLatestIssueDTOSchema = z.object({
  month: z.string(),
  title: z.string(),
  titleEn: z.string(),
  subtitle: z.string().nullable(),
  coverImage: z.string().nullable(),
  url: z.string(),
})
export type PaulRockstarLatestIssueDTO = z.infer<typeof PaulRockstarLatestIssueDTOSchema>
