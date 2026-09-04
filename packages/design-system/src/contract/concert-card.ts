import type { ReactNode } from 'react'
import type { CoverTone } from '../tokens'

/**
 * `ConcertCard` 의 계약. 규율은 `./index.ts`.
 *
 * **여기가 값 층이 실제로 선 첫 자리다.** `button.ts`·`toast.ts` 는 아직 타입뿐이고 치수가
 * 양쪽에 손으로 두 번 적혀 있는데(`toast.ts` 는 그래서 이미 갈라졌다), `bare` 섀시는 두 구현이
 * 같은 날 쓰여 아직 안 갈렸다. **안 갈렸을 때 묶어야 안 갈린다** — 갈린 뒤엔 어느 쪽이 정본인지
 * 사람이 먼저 정해야 하고, 그게 `toast.ts` 가 멈춰 있는 이유다.
 *
 * ## 무엇이 여기 있고 무엇이 없나
 *
 * 있는 것은 **두 구현이 같은 숫자를 써야 하는 것**뿐이다. 없는 것 둘:
 *
 * - **웹 `@media(tablet)` 값** — gap 13 · 제목 16/23 · 메타 15/23 · 예약 46 · 이니셜 76.
 *   RN 엔 미디어 쿼리가 없어 **상대가 없다.** 갈라질 짝이 없으면 계약이 아니므로
 *   웹 `ConcertCard.css.ts` 에 그대로 남는다. 여기 값은 전부 **모바일 기준**이다.
 * - **색** — `vars.color.strong` ↔ `scheme.strong` 으로 양쪽이 자기 토큰 맵에서 읽는다.
 *   `tokens/` 가 정본이고 여기로 올리지 않는다(`./index.ts` 불변식).
 */

/**
 * 섀시 축. 웹 `ConcertCard.css.ts` 의 슬롯 그룹과 1:1.
 *
 * ⚠️ **native 는 `bare` 하나만 구현한다.** 못 옮긴 게 아니라 아직 안 옮긴 것이라, native 쪽엔
 * `variant` prop 자체가 없다 — 있는데 안 먹는 prop 은 거짓말을 한다. 옮길 때 prop 을 열면
 * 그때가 계약 확장이고, 순서는 그대로 **웹부터**다.
 */
export type ConcertCardVariant = 'framed' | 'bare' | 'cover'

/**
 * `bare` 섀시가 받는 props — **두 구현이 글자 그대로 같은 것.**
 *
 * `./index.ts` 는 "prop 인터페이스 전체를 올리지 않는다" 고 적어 두었는데, 그 근거는
 * *공통 조상이 없다* 였다 — 웹 `Button` 은 `ButtonHTMLAttributes` 를, native 는
 * `TouchableOpacityProps` 를 extends 하므로 억지로 묶으면 갈 곳 없는 prop 이 생긴다.
 *
 * **`ConcertCard` 는 양쪽 다 아무것도 extends 하지 않는다.** 근거가 성립하지 않으므로
 * 규칙도 걸리지 않는다. 이름을 두 번 적을 이유가 없다 — 두 번 적으면 한쪽에서만 optional 이
 * 되거나 한쪽 주석만 갱신되는 식으로 조용히 갈린다.
 *
 * 여기 없는 것은 **한쪽에만 있는 것**뿐이다:
 *   웹 — `matchLabel`(framed 전용) · `eyebrow`(cover 전용) · `variant` · `className`
 *   native — 없다
 */
export interface ConcertCardBareProps {
  tone: CoverTone
  /** 커버 대형 이니셜(자모). `posterUrl` 없을 때만 노출. */
  initial: string
  /** 실제 포스터 URL. 있으면 tone·이니셜 대신 포스터가 커버를 채운다. */
  posterUrl?: string | null
  title: string
  /** `롤링홀 · 서울 · 7.24 금`. */
  meta: string
  /** meta 아래 슬롯 — 공연장 줄 등. 없으면 미노출. */
  footer?: ReactNode
  /**
   * 커버 **우하단** 액션 슬롯(시안 `btn/save`).
   * 자리만 카드가 정하고 내용물은 소비처가 준다.
   */
  coverAction?: ReactNode
  /**
   * 제목 **2줄 높이를 예약**한다 (기본 off).
   *
   * 켜는 자리 = **그리드** — 카드가 가로로 줄지어 서므로, 제목 줄 수가 다른 이웃끼리 날짜·공연장
   * 줄이 어긋난다. 예약하면 그 줄들이 행 단위로 정렬된다.
   * 끄는 자리 = **레일** — 시안(`931:84`)이 1줄 제목 기준이라, 예약하면 제목 아래 빈 줄이 생긴다.
   *
   * 웹 `framed` 는 자체 `minHeight` 로 항상 예약하므로 이 prop 을 보지 않는다.
   */
  reserveTitleLines?: boolean
}

/**
 * `bare` 섀시의 치수 — 시안 dice.fm 리스킨(Figma `931:32`·`931:259`).
 *
 * 웹은 `.css.ts` 에서, native 는 `styled` 객체에서 이 표를 읽는다. 그래서 "값이 갈리면 버그다"
 * 가 주석의 다짐이 아니라 **한 곳을 고치면 양쪽이 따라오는 사실**이 된다.
 */
export const CONCERT_CARD_BARE_SPEC = {
  /** 커버와 텍스트 블록 사이. */
  gap: 11,
  /** 커버 — 4:3 한 장. 웹은 `'4 / 3'` 문자열, RN 은 숫자라 나눗셈 결과로 둔다. */
  coverAspectRatio: 4 / 3,
  coverRadius: 8,
  /** 포스터가 없을 때 색면 위에 얹는 대형 이니셜. */
  initialFontSize: 62,
  /** 웹은 `color-mix` 로, RN 은 노드 투명도로 낸다 — 비율 하나로 둘 다 표현된다. */
  initialOpacity: 0.2,
  /** `coverAction` 슬롯이 커버 우하단에서 떨어지는 거리. */
  coverActionInset: 10,
  /** 제목 · 메타 · footer 세 줄 사이. */
  metaGap: 2,
  /** 제목은 항상 2줄에서 자른다. */
  titleLines: 2,
  titleFontSize: 15,
  titleLineHeight: 21,
  /**
   * 토큰 스케일 밖 리터럴이다 — `fontWeight` 축은 300·400·500·600 넷이고 카드 제목만 700 을
   * 쓴다. 스케일을 이 한 자리 때문에 늘리지 않는다(`Button` 의 `cta: 15px` 과 같은 예외).
   */
  titleFontWeight: '700',
  /** 2줄 예약 높이 = 2 × `titleLineHeight`. `reserveTitleLines` 가 켜졌을 때만 쓴다. */
  titleReservedHeight: 42,
  metaFontSize: 13.5,
  metaLineHeight: 21,
} as const
