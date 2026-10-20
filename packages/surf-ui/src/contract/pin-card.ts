/**
 * `PinCard` 의 계약. 규율은 `./index.ts`.
 *
 * **prop 인터페이스는 올리지 않는다** — 웹은 `HTMLAttributes<HTMLDivElement>` 를 extends 하고
 * 제목을 `children`(링크 엘리먼트)으로 받는다. native 는 `title` 문자열 + `onPress` 다.
 * 여기 있는 건 두 구현이 같은 숫자를 써야 하는 것뿐이다. 색 · 모서리는 토큰(`radiusPoster`)이 정본이다.
 */
export const PIN_CARD_SPEC = {
  /** 포스터를 받기 전 · 없을 때 비율 — 3:4. 받으면 원래 비율로 선다. */
  posterFallbackRatio: 3 / 4,
  /** 포스터 없는 자리의 글자 안쪽 여백. */
  posterEmptyPadding: 16,
  /** `action` 슬롯이 포스터 오른쪽 아래에서 떨어지는 거리. */
  actionInset: 8,
  /** 포스터와 제목 사이. */
  captionGap: 8,
  /** 제목 · 출처 줄의 좌우 들여쓰기. */
  captionInset: 4,
  /** 제목과 출처 사이. */
  metaGap: 2,
  titleLines: 2,
  titleFontSize: 14,
  titleLineHeight: 19,
  metaFontSize: 12,
  metaLineHeight: 16,
  /** 누르는 동안(native) · hover(웹) 포스터 밝기. 웹은 `brightness`, RN 은 투명도로 낸다. */
  pressedDim: 0.88,
  /** 포스터가 도착했을 때 페이드인(native). 모션 감소 설정이면 생략한다. */
  posterFadeMs: 180,
  /** 시안 열 폭 — `pinCardHeight` 가 px 캡션을 열 폭 비율로 바꿀 때 쓴다. */
  nominalWidth: 171,
} as const

/**
 * 카드 한 장의 높이 추정(열 폭 = 1) — 웹 `Masonry` 의 `heightOf` 에 그대로 쓴다.
 * 제목은 두 줄로 친다. 출처가 없으면 그 줄을 뺀다.
 * @param ratio 포스터 가로 ÷ 세로. 모르면 `undefined` — 3:4 로 친다.
 * @example pinCardHeight(3 / 4, true) // 1.333 + 64 / 171
 */
export const pinCardHeight = (ratio: number | undefined, hasMeta: boolean) => {
  const s = PIN_CARD_SPEC
  const caption =
    s.captionGap + s.titleLines * s.titleLineHeight + (hasMeta ? s.metaGap + s.metaLineHeight : 0)
  return 1 / (ratio || s.posterFallbackRatio) + caption / s.nominalWidth
}
