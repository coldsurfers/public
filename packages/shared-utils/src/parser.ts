export interface TryParseOptions<T> {
  /** 파싱 실패 시 돌려줄 값. 없으면 `undefined`. */
  fallback?: T
  /** `false` 면 실패를 `console.warn` 으로 남긴다. 기본은 조용히 넘어간다. */
  silent?: boolean
}

/**
 * throw 하지 않는 `JSON.parse`.
 *
 * 기본 타입 인자가 `unknown` 인 이유: 파싱 결과는 런타임에 무엇이든 될 수 있어서, 호출부가
 * 좁히지 않고 쓰면 타입이 거짓말을 한다. 형태를 아는 쪽이 `tryParse<Config>(raw)` 로 선언한다.
 */
export function tryParse<T = unknown>(
  jsonString: string,
  { silent = true, fallback }: TryParseOptions<T> = {},
): T | undefined {
  try {
    return JSON.parse(jsonString) as T
  } catch (e) {
    if (!silent) {
      console.warn('JSON parse error, return fallback:', e, '| input:', jsonString)
    }

    return fallback
  }
}
