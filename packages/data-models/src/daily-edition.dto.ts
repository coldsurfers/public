import { z } from 'zod'
import { ConcertDTOSchema } from './concert.dto'

/**
 * `/daily` 편의 **본문 스키마** — 편이 정적 `.ts` 를 떠나 DB `Feed.payload` 로 옮겨가면서
 * 필요해진 것.
 *
 * 정적 파일이던 시절엔 tsc 가 편의 모양을 지켰다. payload 는 `Json` 컬럼이라 그 검증이
 * 통째로 사라지므로, 여기 스키마가 **쓰기(생성기)·읽기(API) 양쪽**에서 그 자리를 대신한다.
 * `@paul-rockstar/daily` 의 `DailyEditionData` 는 이 스키마에서 파생한다 — 타입을 두 번 적어
 * 어긋나게 두지 않는다.
 *
 * ⚠️ 사실 층(제목·공연장·시각)은 **생성 시점에 얼어붙는다.** DB 에서 라이브로 다시 읽지 않는
 * 이유는 `ended` 다 — `startsAt < 지금` 으로 렌더 때마다 계산하면 장기 상연작이 첫날 지나자마자
 * 끝난 것으로 찍힌다. 회고호는 그 자체로 그 시점의 기록이다.
 *
 * 정본: https://github.com/coldsurfers/paul-rockstar/issues/312
 */

/**
 * 시리즈 key — URL 의 첫 마디(`/daily/<series>/<slug>`).
 *
 * 라벨·리드·케이던스는 `@paul-rockstar/daily` 의 `DAILY_SERIES` 가 들고, 여기는 **키만** 든다.
 * 그쪽이 이 enum 과 어긋나면 그 패키지의 tsc 가 잡는다.
 */
export const DailyEditionSeriesSchema = z.enum(['new-shows', 'weekend', 'popular'])
export type DailyEditionSeries = z.infer<typeof DailyEditionSeriesSchema>

/** 공연장 — 좌측 레일의 주인이자 알림받기의 대상. `id` 는 구독 `targetId`(`Venue.id`). */
export const DailyVenueSchema = z.object({
  id: z.string(),
  /** `/venue/$slug`. */
  slug: z.string(),
  name: z.string(),
  /** `서울 종로구` — 주소 앞 두 마디. 시/도만 아는 곳은 그것만. */
  region: z.string(),
})
export type DailyVenue = z.infer<typeof DailyVenueSchema>

/** 판매처 한 곳 — 가드레일 `click_find_ticket` 이 요구하는 최소 단위. */
export const DailyTicketSchema = z.object({
  /** `놀유니버스` · `네이버N예약` — 계측의 `seller_name`. */
  seller: z.string(),
  url: z.string(),
})
export type DailyTicket = z.infer<typeof DailyTicketSchema>

/** 편이 가리키는 공연 한 건 — 픽과 행이 공유하는 *사실*. 여긴 편집 문장이 없다. */
export const DailyConcertSchema = z.object({
  /** 공연 상세 라우트 `/event/$slug` 의 slug. */
  slug: z.string(),
  title: z.string(),
  /** 장르 칩 라벨. mono·대문자로 렌더된다 (`CLASSIC`). */
  genre: z.string(),
  venue: DailyVenueSchema,
  /** 공연 시작 시각 (ISO, UTC). 날짜·시각 표기가 둘 다 여기서 파생한다. */
  startsAt: z.string().datetime(),
  /**
   * 이미 끝난 공연인가 — 회고호(인기호)만 채운다. `undefined` 는 *아직* 이 아니라
   * **판정하지 않았다**다. 파생하지 않고 필드로 굳히는 이유는 파일 상단 ⚠️ 참고.
   */
  ended: z.boolean().optional(),
  /** 판매처 — 없으면 표면이 예매 칸을 접는다. */
  ticket: DailyTicketSchema.nullable(),
  /** 포스터 이미지 URL. `null` 이면 표면이 색면 커버로 접는다. */
  poster: z.string().nullable(),
})
export type DailyConcert = z.infer<typeof DailyConcertSchema>

/** 목록 행 — 섹션의 나머지 공연. 편집은 한 줄뿐이고, 주말호는 그마저 비운다. */
export const DailyRowSchema = DailyConcertSchema.extend({
  reason: z.string().optional(),
})
export type DailyRow = z.infer<typeof DailyRowSchema>

/** 섹션의 픽 — 행과 달리 **산문**이 붙는다. 픽이 편을 편답게 만든다. */
export const DailyPickSchema = DailyConcertSchema.extend({
  /** 커버 아래 한 문장 — 이 공연을 왜 골랐는지의 결론. */
  headline: z.string(),
  /** 산문 본문. 항목 하나가 한 문단. */
  body: z.string().array(),
})
export type DailyPick = z.infer<typeof DailyPickSchema>

/** 테마 묶음 — 다이제스트의 `sections[]` 에 픽 하나가 얹힌 것. */
export const DailySectionSchema = z.object({
  title: z.string(),
  pick: DailyPickSchema,
  rows: DailyRowSchema.array(),
})
export type DailySection = z.infer<typeof DailySectionSchema>

/** 편 한 호의 본문 전부. */
export const DailyEditionDataSchema = z.object({
  series: DailyEditionSeriesSchema,
  /**
   * URL slug. ⚠️ 유일성은 **시리즈 안에서만** 요구한다 — 같은 날 인기호와 신규공연호가 함께
   * 나가면 두 편의 slug 가 같아진다. 그래서 조회 키가 `(series, slug)` 다.
   */
  slug: z.string(),
  /** 발행일 `YYYY-MM-DD` (KST). 제목·커버 숫자·정렬이 전부 여기서 파생된다. */
  publishedAt: z.string(),
  /** (선택) 편 고유 제목. 없으면 발행일 + `새로 올라온 공연 가이드`. 주말호가 이 필드를 쓴다. */
  title: z.string().optional(),
  /** 편집 총평 — 편의 리드이자 목록 카드의 본문. */
  intro: z.string(),
  sections: DailySectionSchema.array(),
})
export type DailyEditionData = z.infer<typeof DailyEditionDataSchema>

/**
 * `Feed.payload` 에 실제로 저장되는 것 — **한 벌에 두 렌즈**.
 *
 * 앞의 넷(`title`·`description`·`data`·`createdAt`)은 기존 `FeedConcertListDTOSchema` 와 같은
 * 모양이다. 편 Feed 가 `entityType: 'CONCERT_LIST'` 를 그대로 쓰기 때문에(결정 14) 알림 카드가
 * 이 넷만 보고 기존 경로로 그려진다 — web-next 무수정.
 *
 * `edition` 은 그 위에 얹힌 편 본문이고 `/v1/daily/*` 만 읽는다. zod 는 모르는 키를 버리므로
 * 알림 응답(`FeedDailyEditionDTOSchema`)에서는 조용히 떨어진다 — 30KB 짜리 본문이 알림 목록에
 * 실려 나가지 않는다.
 */
export const DailyEditionFeedPayloadSchema = z.object({
  title: z.string(),
  description: z.string(),
  /** 알림 포스터 띠가 그리는 대표 공연들. 편 본문이 아니라 *요약*이다. */
  data: ConcertDTOSchema.array(),
  createdAt: z.string().datetime(),
  edition: DailyEditionDataSchema,
})
export type DailyEditionFeedPayload = z.infer<typeof DailyEditionFeedPayloadSchema>

/**
 * 목록 한 줄 — **편 본문을 뺀 요약**. `/v1/daily` 가 이 모양으로만 답한다.
 *
 * 편 하나의 payload 가 30KB 안팎이라 목록이 본문을 실어 나르면 1년치가 10MB 를 넘는다. 그래서
 * 목록은 카드가 실제로 그리는 것까지만 든다 — 제목·리드·커버 포스터·규모.
 *
 * ⚠️ `poster`·`concertCount`·`sectionCount` 는 편 본문에서 **파생**한다(`sections[0].pick.poster` ·
 * 픽+행의 합 · 섹션 수). 정적 파일 시절엔 표면이 편을 통째로 들고 있어 그 자리에서 셌지만,
 * 목록이 요약만 받게 되면서 세는 자리가 서버로 옮겨왔다. 안 실으면 목록 카드가 커버와
 * `공연 10건 · 4개 묶음` 을 잃는다.
 */
export const DailyEditionSummaryDTOSchema = z.object({
  series: DailyEditionSeriesSchema,
  slug: z.string(),
  publishedAt: z.string(),
  /** 편 고유 제목. 없는 편(신규공연호 대부분)은 표면이 발행일로 만든다. */
  title: z.string().nullable(),
  intro: z.string(),
  /** 첫 묶음 픽의 포스터 — 편의 얼굴. `null` 이면 표면이 색면 커버로 접는다. */
  poster: z.string().nullable(),
  /** 픽과 행을 합친 공연 수. */
  concertCount: z.number().int(),
  sectionCount: z.number().int(),
})
export type DailyEditionSummaryDTO = z.infer<typeof DailyEditionSummaryDTOSchema>
