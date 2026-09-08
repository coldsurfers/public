/**
 * KOPIS(공연예술통합전산망) 공연 상세의 `price` 문자열을 좌석 등급별 가격표로 파싱한다.
 *
 * KOPIS 는 **공연당 price 문자열 1개**를 준다(판매처는 별개로 N개). 형태는 비정형이며 콤마·
 * 공백으로 좌석 등급을 나열한다:
 *   "지정석 143,000원, 스탠딩석 132,000원"  → 2행
 *   "R석 99,000원, S석 88,000원, A석 66,000원"
 *   "전석 55,000원" / "143,000원"(등급명 없음) / "무료"
 *
 * 설계 원칙 — **fail-open**: 절대 throw 하지 않는다. 해석 불가 세그먼트는 버리고, 전체가
 * 해석 불가면 `[]` 를 돌려준다(호출부는 빈 배열 = "가격 미상" 으로 취급).
 *
 * 알려진 한계: "5만원" 같은 한글 단위 표기는 파싱하지 않는다(숫자+"원" 인접만 인식) — 잘못된
 * 값(5)을 만드느니 버리는 쪽. KOPIS 는 대부분 "50,000원" 처럼 전체 자릿수로 표기한다.
 */

export interface KopisPrice {
  /** 좌석 등급명. KOPIS 표기 그대로 (예: "지정석", "R석"). 등급명이 없으면 "전석". */
  name: string
  /** 원화 정수 금액. */
  price: number
  currency: 'KRW'
}

/** 등급명 없이 금액만 있을 때의 기본 등급 표기 (KOPIS 관용 "전석"). */
const DEFAULT_SEAT_NAME = '전석'

/** `숫자[,숫자]… 원` — 콤마 포함 금액 + "원". 앞의 임의 텍스트는 등급명으로 회수한다. */
const AMOUNT_RE = /([\d][\d,]*)\s*원/g

/** 등급명 가장자리의 콤마·공백·구분자를 정리하고 내부 공백을 단일화한다. */
function cleanSeatName(raw: string): string {
  return raw
    .replace(/[,\s/·|]+$/u, '')
    .replace(/^[,\s/·|]+/u, '')
    .replace(/\s+/gu, ' ')
    .trim()
}

/**
 * KOPIS `price` 문자열 → 좌석별 `KopisPrice[]`.
 * 무료 공연("무료"·"free")은 `price: 0` 한 행으로. "초대"·"미정"·"전화문의" 등 금액 미상은 `[]`.
 */
function parse(raw: string | null | undefined): KopisPrice[] {
  if (!raw) {
    return []
  }

  const out: KopisPrice[] = []
  let cursor = 0
  AMOUNT_RE.lastIndex = 0

  for (let m = AMOUNT_RE.exec(raw); m !== null; m = AMOUNT_RE.exec(raw)) {
    const price = Number(m[1].replace(/,/gu, ''))
    if (!Number.isNaN(price)) {
      // 직전 매치 끝 ~ 이번 금액 시작 사이의 텍스트가 이 금액의 등급명.
      const name = cleanSeatName(raw.slice(cursor, m.index))
      out.push({ name: name || DEFAULT_SEAT_NAME, price, currency: 'KRW' })
    }
    cursor = AMOUNT_RE.lastIndex
  }

  if (out.length === 0 && /무료|무료입장|\bfree\b/iu.test(raw)) {
    return [{ name: DEFAULT_SEAT_NAME, price: 0, currency: 'KRW' }]
  }

  return out
}

export const kopisPriceUtils = {
  parse,
}
