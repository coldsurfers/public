import { z } from 'zod'

export const MarketingConsentDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  optedIn: z.boolean(),
  createdAt: z.date(),
})
export type MarketingConsentDTO = z.infer<typeof MarketingConsentDTOSchema>

export const UpdateMarketingConsentBodyDTOSchema = z.object({
  optedIn: z.boolean(),
})
export type UpdateMarketingConsentBodyDTO = z.infer<typeof UpdateMarketingConsentBodyDTOSchema>

export const NightMarketingConsentDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  optedIn: z.boolean(),
  createdAt: z.date(),
})
export type NightMarketingConsentDTO = z.infer<typeof NightMarketingConsentDTOSchema>

export const UpdateNightMarketingConsentBodyDTOSchema = z.object({
  optedIn: z.boolean(),
})
export type UpdateNightMarketingConsentBodyDTO = z.infer<
  typeof UpdateNightMarketingConsentBodyDTOSchema
>
