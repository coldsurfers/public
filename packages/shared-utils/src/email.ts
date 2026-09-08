/**
 * 이메일 신원 정규화 — 서버(인증·발송)와 클라이언트가 나눠 쓰는 SSOT.
 *
 * 같은 받은편지함이 `+alias` 태그(예: `you+test1@gmail.com`)로 여러 계정·구독처럼 취급되는 것을
 * 막는다 — trim + lowercase, 로컬파트의 `+` 이후는 제거.
 *
 * **dot 은 건드리지 않는다.** Gmail 은 dot 을 무시하지만 다른 프로바이더는 실제로 다른 주소로
 * 구분하는 경우가 있어, 전 도메인 일괄 제거는 서로 다른 사람을 한 계정으로 합칠 위험이 있다.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase()
  const atIndex = trimmed.lastIndexOf('@')
  if (atIndex <= 0) return trimmed
  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  const plusIndex = local.indexOf('+')
  const normalizedLocal = plusIndex > 0 ? local.slice(0, plusIndex) : local
  return `${normalizedLocal}@${domain}`
}
