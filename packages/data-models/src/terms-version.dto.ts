import { z } from 'zod'
import { MarketingConsentDTOSchema, NightMarketingConsentDTOSchema } from './marketing-consent.dto'

export const TermsTypeDTOSchema = z.enum(['SERVICE', 'PRIVACY'])
export type TermsTypeDTO = z.infer<typeof TermsTypeDTOSchema>

export const TermsVersionDTOSchema = z.object({
  id: z.string(),
  type: TermsTypeDTOSchema,
  version: z.string(),
  effectiveDate: z.string().datetime(),
  isActive: z.boolean(),
})
export type TermsVersionDTO = z.infer<typeof TermsVersionDTOSchema>

export const RequiredConsentsDTOSchema = z.object({
  terms: TermsVersionDTOSchema.array(),
})
export type RequiredConsentsDTO = z.infer<typeof RequiredConsentsDTOSchema>

export const UserConsentsRequiredDTOSchema = z.object({
  pendingTerms: TermsVersionDTOSchema.array(),
  marketingConsent: MarketingConsentDTOSchema.nullable(),
  nightMarketingConsent: NightMarketingConsentDTOSchema.nullable(),
})
export type UserConsentsRequiredDTO = z.infer<typeof UserConsentsRequiredDTOSchema>

export const CreateTermsAgreementBodyDTOSchema = z.object({
  termsVersionId: z.string(),
})
export type CreateTermsAgreementBodyDTO = z.infer<typeof CreateTermsAgreementBodyDTOSchema>

export const GetTermsVersionQueryStringDTOSchema = z.object({
  type: TermsTypeDTOSchema.optional(),
})
export type GetTermsVersionQueryStringDTO = z.infer<typeof GetTermsVersionQueryStringDTOSchema>
