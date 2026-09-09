import { z } from 'zod'

export const TermsAgreementDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  termsVersionId: z.string(),
  agreedAt: z.date(),
})
export type TermsAgreementDTO = z.infer<typeof TermsAgreementDTOSchema>
