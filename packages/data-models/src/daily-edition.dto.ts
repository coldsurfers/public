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
 *
 * `features` 만 상류가 달력이 아니라 **사건**이다 — 형제 셋은 각자 자동 상류(신규 등록·주말·
 * 조회수)에서 나오는데, 이쪽은 명절·연휴처럼 그때만 서는 축이라 사람이 범위를 정한다.
 * 그래서 케이던스를 약속하지 않는다.
 */
export const DailyEditionSeriesSchema = z.enum(['new-shows', 'weekend', 'popular', 'features'])
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

/**
 * 산문 편의 본문 블록.
 *
 * 레퍼런스(Bandcamp Daily `/features`)의 55블록짜리 기사를 DOM 으로 뜯어 나온 것이 **4종뿐**이다 —
 * `P` · `PLAYER` · `IMG` · `HR`. 소제목(h2/h3)과 인용구는 **0개**였다. 그래서 그 넷만 연다.
 *
 * ⚠️ `quote`·`heading` 을 미리 열지 않는다. 첫 편이 실제로 쓸 때 연다 — 쓰지 않는 종류를
 * 열어두면 렌더러가 쓰이지 않는 분기를 지고 간다.
 */
export const DailyBlockSchema = z.discriminatedUnion('type', [
  /** 한 문단. 인라인 markdown 은 **링크·강조만** 허용한다(블록 문법은 블록이 든다). */
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  /**
   * 본문 위치에 꽂히는 공연 — 레퍼런스의 `PLAYER` 자리.
   *
   * 이것이 끝에 모으는 `relatedConcerts[]` 를 **대체한다**. 글이 공연을 가리키는 자리는 본문
   * 안이고, 끝에 모으면 문맥이 끊긴다.
   *
   * **사실을 통째로 든다** — 픽(`DailyPickSchema`)과 같은 축이다. 처음엔 slug 하나만 뒀다.
   * 레퍼런스가 body 에 `playerMap["t<id>"]` 의 id 만 두고 실물을 별도 JSON 으로 주길래 그 꼴을
   * 따랐는데, 우리 읽기 면에는 그 *별도 JSON* 에 해당하는 두 번째 응답이 없다. 그래서 표면이
   * 티켓을 못 그리고 slug 를 글자 그대로 뱉었다(paul-rockstar#484 리뷰).
   *
   * ⚠️ 그래서 사실도 **발행 시점에 얼어붙는다.** 파일 상단 ⚠️ 와 같은 규약이고, 근거도 같다 —
   * 렌더마다 DB 를 다시 읽으면 `ended` 가 장기 상연작을 첫날 지나자마자 끝난 것으로 찍는다.
   * 채우는 건 사람이 아니라 발행 파이프다(`publish-prose.ts` 가 매니페스트의 slug 를 조회로
   * 치환한다) — 매니페스트는 가리키고, 실물은 파이프가 채운다.
   */
  z.object({ type: z.literal('concert'), concert: DailyConcertSchema }),
  /**
   * 본문 사진 — 레퍼런스의 `IMG` 자리(한 기사에 6장 썼다).
   *
   * ⚠️ `url` 은 **발행 시점에 얼어붙는다.** 편 payload 는 구워진 날의 값을 그대로 들고, 원천을
   * 고쳐도 소급되지 않는다 — 죽은 이미지 호스트가 편 안에 남아 SQL 로 직접 친 전례가 있다
   * (paul-rockstar#483). 호스트를 여기서 막지는 않되, 수명을 통제하는 곳에 올려 쓴다.
   */
  z.object({
    type: z.literal('image'),
    url: z.string(),
    /** 대체 텍스트. 비울 수 없다 — 읽기 지면의 사진은 장식이 아니다. */
    alt: z.string(),
    /** (선택) 사진 아래 한 줄. 출처 표기가 필요하면 여기다. */
    caption: z.string().optional(),
  }),
  /** 구분선 — 레퍼런스가 산문과 Q&A 를 가른 자리. */
  z.object({ type: z.literal('divider') }),
])
export type DailyBlock = z.infer<typeof DailyBlockSchema>

/** 두 갈래가 공유하는 편의 **신원** — URL 과 발행일. 본문만 갈린다. */
const editionIdentity = {
  series: DailyEditionSeriesSchema,
  /**
   * URL slug. ⚠️ 유일성은 **시리즈 안에서만** 요구한다 — 같은 날 인기호와 신규공연호가 함께
   * 나가면 두 편의 slug 가 같아진다. 그래서 조회 키가 `(series, slug)` 다.
   */
  slug: z.string(),
  /** 발행일 `YYYY-MM-DD` (KST). 제목·커버 숫자·정렬이 전부 여기서 파생된다. */
  publishedAt: z.string(),
}

/**
 * 다이제스트 편 — 공연 묶음이 본문인 지금까지의 편 전부.
 *
 * 신규공연호·주말호·인기호가 이 모양이고, **필드가 하나도 바뀌지 않았다**(`kind` 만 얹혔다).
 */
export const DailyDigestEditionSchema = z.object({
  ...editionIdentity,
  kind: z.literal('digest'),
  /** (선택) 편 고유 제목. 없으면 발행일 + `새로 올라온 공연 가이드`. 주말호가 이 필드를 쓴다. */
  title: z.string().optional(),
  /** 편집 총평 — 편의 리드이자 목록 카드의 본문. */
  intro: z.string(),
  sections: DailySectionSchema.array(),
})
export type DailyDigestEdition = z.infer<typeof DailyDigestEditionSchema>

/**
 * 산문 편 — **글이 본문인** 편. `features` 안에 선다.
 *
 * 다이제스트와 갈리는 지점이 셋이다.
 * - `title` 이 **필수**다. 글에 제목이 없을 수 없다(다이제스트는 발행일로 만들어 쓴다).
 * - `intro` 가 아니라 `lead` 다. 역할이 다르다 — 저쪽은 *총평*, 이쪽은 *도입부*다.
 * - 본문이 `sections[]` 가 아니라 `body: Block[]` 다.
 */
export const DailyProseEditionSchema = z.object({
  ...editionIdentity,
  kind: z.literal('prose'),
  title: z.string(),
  /** 도입부 — 제목 아래 한 단락. 목록 카드의 본문도 이것을 쓴다. */
  lead: z.string(),
  /**
   * 본문.
   *
   * ⚠️ `concert` 블록이 **최소 하나** 있어야 한다. 없으면 알림 카드가 빈손이고(`payload.data` 를
   * 이 블록들에서 모은다), 산문 편도 결국 공연으로 보내는 글이라 이 강제가 제품과도 맞다.
   */
  body: DailyBlockSchema.array().refine(
    (blocks) => blocks.some((block) => block.type === 'concert'),
    { message: 'concert 블록 최소 1개' },
  ),
  /**
   * (선택) 편의 얼굴 — 목록 카드의 커버. 다이제스트가 `sections[0].pick.poster` 로 세우는 자리다.
   *
   * 본문 첫 사진을 자동으로 쓰지 않는다. 목록에 걸리는 한 장은 편집 선택이고, 글 안의 사진은
   * 그 자리의 맥락에 붙은 것이라 축이 다르다.
   */
  cover: z.string().nullable().optional(),
  /**
   * (선택) 글쓴이 — **핸들 문자열 하나**. 다이제스트에는 없는 칸이다(기계가 굽고 사람은 문장만
   * 얹어서 바이라인이 설 자리가 없다). 없으면 표면이 그 칸을 접는다.
   *
   * **왜 union 이 아니라 `string` 인가.** 진용의 정본은 소비처 레포의 `@paul-rockstar/persona`
   * (`EditorialHandle`)이고, 그걸 여기서 물면 계약 패키지가 소비처를 아는 거꾸로가 된다. 대신
   * 아는 쪽이 좁힌다 — 발행 파이프가 진용에 없는 핸들을 거부하고, 표면은 `personaByHandle` 로 푼다.
   * 저쪽 `Pick.author` 가 이미 같은 꼴이다.
   *
   * URL 슬러그를 겸한다 — 글쓴이 지면(`/daily/contributors/<핸들>`)이 이 값으로 선다. 그래서
   * 표시 이름(`윤슬`)이 아니라 핸들(`yoonseul`)을 든다: 이름은 바뀌어도 주소는 안 바뀌어야 한다.
   */
  author: z.string().optional(),
})
export type DailyProseEdition = z.infer<typeof DailyProseEditionSchema>

/**
 * 편 한 호의 본문 전부 — `kind` 로 갈리는 두 갈래.
 *
 * ⚠️ **`z.preprocess` 가 앞에 있는 이유.** 이미 발행된 편들의 payload 에는 `kind` 가 없다.
 * 판별자가 없으면 `discriminatedUnion` 은 어느 가지로 갈지 못 정하고 그 자리에서 떨어지는데,
 * 읽는 쪽(`/v1/daily/*`)은 파싱에 실패한 편을 **조용히 `null` 로 버린다**. 즉 그냥 얹으면
 * 아카이브가 통째로 사라진다.
 *
 * `kind: z.literal('digest').default('digest')` 로는 안 구해진다 — 기본값은 **디스패치 이후에**
 * 적용된다. 그래서 정규화를 스키마 바깥 경계에서 한 번 한다.
 *
 * ⚠️ **`z.union` 으로 도망가지 않는다.** 통과는 하지만 실패 진단이 무너진다 — 두 가지를 다 훑고
 * 최상위에서 `"": Invalid input` 하나만 뱉어 경로도 이유도 없다. 편이 상하면 읽는 쪽이 콘솔에만
 * 찍고 버리므로 **그 콘솔 한 줄이 유일한 단서다.**
 *
 * shim 은 영구물이 아니다. 저장된 편에 `kind: 'digest'` 를 한 번 백필하면 뗄 수 있다.
 */
export type DailyEditionData = DailyDigestEdition | DailyProseEdition

/**
 * ⚠️ **타입을 손으로 적는다** — 여기만 `z.infer` 를 안 쓴다.
 *
 * 추론에 맡기면 발행본 `.d.ts` 가 `z.ZodPreprocess<…, unknown>` 을 그대로 적어 내보내는데,
 * 그 인터페이스의 **인자 수가 zod 버전마다 다르다**(4.4.3 은 `<B>` 하나, 4.5.4 는 `<B, I>` 둘).
 * 우리가 4.5.x 로 빌드하고 소비자가 4.4.x 를 물면 그 줄이 TS2558 로 떨어지고, `skipLibCheck`
 * 아래에서는 조용히 **`any`** 가 된다 — 실제로 `@paul-rockstar/daily` 에서 `DailyEditionData` 와
 * `DailyEditionFeedPayload['edition']` 이 둘 다 any 로 풀렸다(0.14.0).
 *
 * `z.ZodType<Output, Input>` 은 두 버전에서 인자 수가 같아 그 틈을 안 만든다. 런타임 스키마는
 * 그대로고, 여기서 좁혀지는 건 타입 표면뿐이다.
 */
export const DailyEditionDataSchema: z.ZodType<DailyEditionData, unknown> = z.preprocess(
  (value) =>
    typeof value === 'object' && value !== null && !('kind' in value)
      ? { kind: 'digest', ...value }
      : value,
  z.discriminatedUnion('kind', [DailyDigestEditionSchema, DailyProseEditionSchema]),
)

/**
 * `Feed.payload` 에 실제로 저장되는 것 — **한 벌에 두 렌즈**.
 *
 * 앞의 넷(`title`·`description`·`data`·`createdAt`)은 기존 `FeedConcertListDTOSchema` 와 같은
 * 모양이다. 편 Feed 가 `entityType: 'CONCERT_LIST'` 를 그대로 쓰기 때문에(결정 14) 알림 카드가
 * 이 넷만 보고 기존 경로로 그려진다 — web-next 무수정.
 *
 * ⚠️ 산문 편은 `entityType` 이 `EDITORIAL` 로 갈리지만 **payload 모양은 같다.** `data` 는 본문의
 * `concert` 블록에서 모은다 — 그래서 그 블록이 최소 하나 강제된다(`DailyProseEditionSchema`).
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
