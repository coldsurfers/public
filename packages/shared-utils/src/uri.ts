/**
 * 이중·삼중 인코딩된 URI 를 더 이상 안 풀릴 때까지 반복 디코딩한다.
 *
 * 잘못된 이스케이프 시퀀스를 만나면 `decodeURIComponent` 가 throw 하는데, 그 직전까지 푼 값을
 * 돌려준다 — 전부 못 푸는 것보다 낫다.
 */
export function fullyDecodeURI(uri: string): string {
  let decoded = uri
  let prevDecoded = ''

  while (decoded !== prevDecoded) {
    prevDecoded = decoded
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      break
    }
  }

  return decoded
}

/**
 * pathname 만 디코딩하고 프로토콜·도메인은 그대로 둔다.
 *
 * URL 로 파싱되지 않으면 문자열 전체를 디코딩한다.
 */
export function fullyDecodePathname(url: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.pathname = fullyDecodeURI(urlObj.pathname)
    return urlObj.toString()
  } catch {
    return fullyDecodeURI(url)
  }
}

/** `%` 가 있는지만 본다 — 인코딩 "가능성" 체크지 확정이 아니다. */
export function isEncoded(str: string): boolean {
  return str.includes('%')
}

/**
 * 실제 이중 인코딩 여부.
 *
 * `%2525` 는 true, `%25` 는 false — `%25` 는 `%` 한 글자의 단일 인코딩이라 더 풀 게 없다.
 */
export function isDoubleEncoded(str: string): boolean {
  return /%25(25)+/i.test(str)
}
