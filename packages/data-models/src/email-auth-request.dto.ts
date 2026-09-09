import { z } from 'zod'

export const EmailAuthRequestDTOSchema = z.object({
  email: z.string().email(),
  authcode: z.string(),
  authenticated: z.boolean(),
  createdAt: z.string().datetime(),
  id: z.string(),
})
export type EmailAuthRequestDTO = z.infer<typeof EmailAuthRequestDTOSchema>

export const SendEmailAuthCodeBodyDTOSchema = z.object({
  email: z.string().email(),
})
export type SendEmailAuthCodeBodyDTO = z.infer<typeof SendEmailAuthCodeBodyDTOSchema>

export const SendAuthCodeResponseDTOSchema = z.object({
  email: z.string().email(),
})
export type SendAuthCodeResponseDTO = z.infer<typeof SendAuthCodeResponseDTOSchema>

export const ConfirmAuthCodeBodyDTOSchema = z.object({
  email: z.string().email(),
  authCode: z.string().length(6),
})
export type ConfirmAuthCodeBodyDTO = z.infer<typeof ConfirmAuthCodeBodyDTOSchema>

export const ConfirmAuthCodeResponseDTOSchema = z.object({
  email: z.string().email(),
  // 코드 verify(이메일 소유 증명) 후 노출 — 신규 가입자면 소비자(/auth)가 계정 생성 전 동의
  // 스텝을 띄운다. 소유 증명 후라 account enumeration 이 아니다. optional — 기존 소비자 무영향.
  isNewUser: z.boolean().optional(),
})
export type ConfirmAuthCodeResponseDTO = z.infer<typeof ConfirmAuthCodeResponseDTOSchema>

// `/v2/auth/email/sessions` (패스워드리스 로그인/가입) 요청. `/verify` 의 ConfirmAuthCodeBody 와
// 분리 — 신규 가입 시 계정 생성과 함께 저장할 consent(약관·마케팅)를 함께 받는다(전부 optional,
// 기존 유저 로그인 시엔 무시). 계정 생성 전 동의(가입 절차 내 수집)를 백엔드에 원자적으로 반영.
export const EmailPasswordlessLoginBodyDTOSchema = z.object({
  email: z.string().email(),
  authCode: z.string().length(6),
  termsVersionIds: z.string().array().optional(),
  marketingConsent: z.boolean().optional(),
  nightMarketingConsent: z.boolean().optional(),
})
export type EmailPasswordlessLoginBodyDTO = z.infer<typeof EmailPasswordlessLoginBodyDTOSchema>
