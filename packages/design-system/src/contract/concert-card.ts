import type { ReactNode } from 'react'
import type { fontFamily } from '../tokens'

type FontFamilyKey = keyof typeof fontFamily

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
 * - **웹 `@media(tablet)` 값** — gap 13 · 이니셜 76.
 *   RN 엔 미디어 쿼리가 없어 **상대가 없다.** 갈라질 짝이 없으면 계약이 아니므로
 *   웹 `ConcertCard.css.ts` 에 그대로 남는다. 여기 값은 전부 **모바일 기준**이다.
 *
 *   ⚠️ 이 목록이 짧아지는 게 좋은 방향이다. 메타(15/23)에 이어 **제목(16/23)·예약(46)도
 *   걷었다** — 글자 크기는 칸이 넓어졌다고 커지는 축이 아니고, 걷을 때마다 두 레인이 같은
 *   숫자 하나로 수렴한다.
 * - **색** — 제목은 `vars.color.text` ↔ `scheme.text`, 날짜는 `muted` 로 양쪽이 자기 토큰
 *   맵에서 읽는다. `tokens/` 가 정본이고 여기로 올리지 않는다(`./index.ts` 불변식).
 *   공연장 줄은 `footer` **슬롯**이라 DS 가 색을 안 정한다 — 소비처가 준 노드를 그대로 그린다.
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
 * 커버 비율 축 — `bare` 섀시가 사는 세 지면.
 *
 * `landscape`(4:3) 는 dice.fm 리스킨 원본(`931:32`)이고, `square`(1:1) 는 billets-app 홈 레일
 * 시안이 요구한다. `portrait`(3:4) 는 **포스터 본래 비율**이다 — 공연 포스터는 세로로 인쇄되고,
 * 가로·정사각 칸에 넣으면 `object-fit: cover` 가 위아래를 잘라 제목 줄이나 출연자 이름이
 * 사라진다. 여러 열 그리드처럼 칸이 세로로 설 수 있는 자리가 그 값을 쓴다.
 *
 * 임의 비율을 prop 으로 받지 않고 축으로 가두는 이유: 커버는 카드 정체성이라 지면마다 다른
 * 비율이 생기면 **같은 카드로 안 보인다.** 값을 늘릴 땐 늘 그 질문을 먼저 한다 — 새 지면이
 * 생겼나, 아니면 한 자리가 취향으로 다르고 싶은 건가.
 *
 * ⚠️ `framed`·`cover` 섀시는 이 축을 보지 않는다 — 둘은 자기 비율을 갖는다.
 */
export type ConcertCardCoverRatio = 'landscape' | 'square' | 'portrait'

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
  /**
   * 커버 대형 이니셜(자모) — 포스터가 **없거나 실패했을 때** 드러나는 워터마크.
   *
   * 커버 바닥은 언제나 `note` 면 하나다(기다림의 면). 그 위에 이니셜이 옅게 앉고, 포스터가
   * 도착하면 그 위를 덮는다. 예전엔 바닥이 `tone` 6톤이었는데 그 축을 걷어냈다 —
   * 「아직 그림이 없다」가 `Skeleton` 과 다른 밝기로 서면 화면이 무거워진다.
   */
  initial: string
  /** 실제 포스터 URL. 있으면 이니셜 위를 포스터가 덮는다. */
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
   * 커버 비율. 기본 `landscape`(4:3).
   *
   * 자를수록 포스터가 말을 잃는다 — 잘리는 순서대로 `landscape` → `square` → `portrait` 다.
   * 레일처럼 카드 폭이 좁으면 `square`(billets-app 홈 시안), 여러 열 그리드처럼 칸이 세로로
   * 설 수 있으면 `portrait`(포스터 본래 비율이라 아무것도 안 잘린다).
   * 축과 값은 `ConcertCardCoverRatio` · `CONCERT_CARD_BARE_SPEC.coverAspectRatio`.
   */
  coverRatio?: ConcertCardCoverRatio
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
  /**
   * 커버 비율표 — 축은 `ConcertCardCoverRatio`. 웹 `aspectRatio` 도 RN 도 숫자를 그대로 먹어
   * 나눗셈 결과로 둔다. **이 표를 늘리면 축도 같이 늘어야 한다** — 한쪽만 늘리면 웹 recipe 에
   * 죽은 클래스가 생기거나 RN 이 `undefined` 를 비율로 받는다.
   */
  coverAspectRatio: { landscape: 4 / 3, square: 1, portrait: 3 / 4 },
  coverRadius: 8,
  /** 포스터가 없을 때 색면 위에 얹는 대형 이니셜. */
  initialFontSize: 62,
  /**
   * 워터마크는 **굵게** 둔다 — `initialOpacity` 0.2 에서 가는 획은 면에 묻혀 글자가 아니라
   * 얼룩으로 읽힌다.
   *
   * ⚠️ 예전엔 이 자리가 `titleFontWeight` 를 빌려 썼는데, 둘이 같은 값이었던 건 **우연**이다.
   * 제목이 시안대로 Medium 으로 내려오면서 워터마크까지 같이 얇아지는 걸로 그게 드러났다 —
   * 한 상수를 두 뜻으로 쓰면 한쪽만 바꾸고 싶은 날 방법이 없다.
   */
  initialFontWeight: '700',
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
   * `medium`(500) — 시안 라이브 목록(Page 16 ①) 실측값.
   *
   * 예전엔 700 이었고, 그때 주석은 「토큰 스케일 밖 리터럴」이라 적어 두었다. 스케일 밖으로
   * 나간 이유가 없어졌다 — **위계를 굵기가 아니라 명도로 낸다.** 카드 세 줄이 이미 세 단이라
   * (제목 `text` / 날짜 `muted` / 공연장은 `footer` 슬롯이라 소비처가 한 단 더 옅게 준다),
   * 제목이 한 번 더 굵어지면 같은 말을 두 번 하고 카드가 목록보다 무거워진다.
   * 700 을 쓰는 자리는 이제 워터마크(`initialFontWeight`)뿐이다.
   */
  titleFontWeight: '500',
  /** 2줄 예약 높이 = 2 × `titleLineHeight`. `reserveTitleLines` 가 켜졌을 때만 쓴다. */
  titleReservedHeight: 42,
  /**
   * 날짜 스탬프는 문장이 아니라 **수치**다. 토큰이 그 자리를 이미 이름 붙여 뒀다 —
   * `fontSize['2xs']`(11px)의 정의가 "mono 메타(수치·코드·콜로폰)" 이고, mono 의 자간은
   * `letterSpacing.none`(0) 이다. 제목 옆에서 sans 13.5 로 서면 제목의 작은 판처럼 읽히는데,
   * 서체가 갈리면 **두 줄이 서로 다른 일을 한다**는 게 한눈에 보인다.
   *
   * 색은 여기 없다 — 위 「무엇이 여기 있고 무엇이 없나」. 두 레인 다 `muted` 를 읽는다.
   *
   * 태블릿 확대(웹 15/23)는 같이 걷어냈다. 스탬프는 화면이 넓어졌다고 커지는 글이 아니다.
   */
  metaFontFamily: 'mono' satisfies FontFamilyKey,
  metaFontSize: 11,
  metaLineHeight: 16,
} as const
