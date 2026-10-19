/**
 * 올리기 전 번들 검사 — 앱에 실린 번들은 누구나 꺼내 본다. 비밀 값으로 보이는 문자열이 있으면 배포를 멈춘다.
 *
 * 형식이 뚜렷한 키만 잡는다. 엔트로피 추정은 압축된 번들에서 오탐이 많아 쓰지 않는다.
 */

export type SecretFinding = {
  rule: string
  line: number
  column: number
  /** 앞 네 글자만 남긴다. 로그에 값을 다시 흘리지 않게 */
  preview: string
}

const RULES: ReadonlyArray<{ rule: string; pattern: RegExp }> = [
  { rule: 'aws-access-key-id', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  // 머리만 있으면 PEM 을 다루는 라이브러리 상수다. 본문(base64)이 이어질 때만 잡는다
  {
    rule: 'private-key',
    pattern: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----(?:\\[rn]|\s)+[A-Za-z0-9+/]{40}/g,
  },
  {
    rule: 'github-token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82})\b/g,
  },
  { rule: 'slack-token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { rule: 'stripe-secret-key', pattern: /\b[rs]k_live_[A-Za-z0-9]{20,}\b/g },
  { rule: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { rule: 'anthropic-api-key', pattern: /\bsk-ant-[A-Za-z0-9_-]{20,}/g },
  { rule: 'openai-api-key', pattern: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}/g },
]

function position(code: string, index: number) {
  const before = code.slice(0, index)
  const line = before.split('\n').length
  return { line, column: index - before.lastIndexOf('\n') }
}

/** `allow` 는 앱에 실어도 되는 공개 값(지도 키 등)을 글자 그대로 받는다 */
export function scanBundle(code: string, allow: readonly string[] = []): SecretFinding[] {
  const allowed = new Set(allow)
  return RULES.flatMap(({ rule, pattern }) =>
    [...code.matchAll(pattern)]
      .filter((match) => !allowed.has(match[0]))
      .map((match) => ({
        rule,
        ...position(code, match.index),
        preview: `${match[0].slice(0, 4)}…(${match[0].length}자)`,
      })),
  )
}

export function formatFindings(file: string, findings: readonly SecretFinding[]): string {
  const lines = findings.map(
    ({ rule, line, column, preview }) => `  ${rule}  ${line}:${column}  ${preview}`,
  )
  return [
    `[react-native-mf] 번들에 비밀 값으로 보이는 문자열이 있어 올리지 않는다(${file}):`,
    ...lines,
    '앱에 실어도 되는 공개 값이면 config 의 `scan.allow` 에 넣는다.',
  ].join('\n')
}
