import { z } from 'zod'
import { ConcertDTOSchema } from './concert.dto'
import { EVENT_CATEGORIES, type EventCategoryName } from './event-category.dto'

// ─── 장르 칩 어휘 ─────────────────────────────────────────────────────────────
//
// 라벨의 정본은 `Artist.genres`(아티스트가 보유 → 그의 모든 미래 공연을 덮는다)고,
// `ConcertLabel` 은 아티스트가 안 붙는 공연의 폴백이다. **두 축이 아니라 한 축의 두 공급원.**
// 한 공연이 양쪽에서 칩을 받으면 아티스트가 이긴다 — 폴백이 "아티스트가 없을 때만"이라는
// 자기 정의를 지키게 되고, 나중에 폴백을 Artist 로 승격시킬 때 기존 라벨을 지울 필요가 없다.

/**
 * KOPIS-fit 장르 칩 어휘. 서구 canon(`PaulRockstarGenre`)과 어휘를 공유하지 않는다 —
 * 공연 풀이 사실상 전량 국내라 트로트·아이돌을 담을 칸이 캐논에 없다.
 *
 * **flat 유니온이고 카테고리 접두사가 없다.** 어느 카테고리 칩인지는 아래 `CHIP_SETS` 가 갖는다 —
 * 접두사(`classic:recital`)는 GIN 인덱스·`hasSome` 질의·기존 12칩을 전부 건드리는 데 비해
 * 얻는 게 "눈으로 구분됨" 뿐이다. 정본: specs/web-next/concert-chip-expansion.md
 */
export const GENRE_CHIPS = [
  // ── Gigs (대중음악 12) ──
  'indie-band',
  'rock-metal',
  'hiphop-rnb',
  'folk-acoustic',
  'jazz',
  'ballad-gayo',
  'trot',
  'idol-kpop',
  'j-rock-pop',
  'overseas-pop',
  'crossover-vocal',
  'gugak-fusion',
  // ── Classic (8) — 배치 20260729-2(8칩 385건) · -3(film-score 46건) ──
  'orchestra',
  'chamber',
  'recital',
  'vocal-opera',
  'choir',
  'early-organ',
  'family-classical',
  // 편성이 아니라 소재. "지브리 영화음악 오케스트라"는 `orchestra` 가 아니라 이 칩이다 —
  // 관객이 사러 오는 건 편성이 아니라 그 영화다. 게임음악 콘서트도 같은 결로 여기 넣는다.
  'film-score',
  // ── Dance (4) — 배치 20260729-4 로 84건 라벨됨 ──
  'ballet',
  'contemporary-dance',
  'korean-dance',
  'street-dance',
  // ── Korean-Traditional (4) — 배치 20260729-5 로 123건 라벨됨 ──
  'gugak-orchestra',
  'pansori',
  'minyo',
  'changgeuk',
  // ── Theatre (5) — **아직 배치 전.** 어휘만 먼저 연다(`CHIP_SETS.Theatre` 는 비어 있음).
  // 편성어(뮤지컬·연극)가 아니라 **무드**다: 제목의 92.7% 에서 형식어가 안 읽히는 반면
  // 대학로에서 관객이 고르는 축은 로코·추리다. 구안 `musical`·`play`·`nonverbal`·
  // `original-premiere` 는 폐기됐다(추천을 안 바꾼다). 정본: concert-chip-expansion.md
  'family-kids',
  'romantic-comedy',
  'mystery-thriller',
  'comedy',
  'horror',
] as const
export type GenreChip = (typeof GENRE_CHIPS)[number]

/**
 * 카테고리별 유효 칩. **한 칩이 여러 카테고리에 속할 수 있다** — `crossover-vocal` 은 Gigs·Classic
 * 양쪽에 있고 `gugak-fusion` 은 Gigs·Korean-Traditional 양쪽이다. 같은 뜻의 칩을 두 개 만들지 않는다.
 *
 * `satisfies` 가 **카테고리 누락**과 **오타 칩**을 컴파일에서 잡는다.
 * 빈 배열 = 아직 라벨 배치가 안 돈 카테고리(어휘 자체가 없는 게 아니다).
 */
export const CHIP_SETS = {
  Gigs: [
    'indie-band',
    'rock-metal',
    'hiphop-rnb',
    'folk-acoustic',
    'jazz',
    'ballad-gayo',
    'trot',
    'idol-kpop',
    'j-rock-pop',
    'overseas-pop',
    'crossover-vocal',
    'gugak-fusion',
  ],
  Classic: [
    'orchestra',
    'chamber',
    'recital',
    'vocal-opera',
    'choir',
    'early-organ',
    'family-classical',
    'film-score',
    'crossover-vocal', // Gigs 와 공유
  ],
  Dance: ['ballet', 'contemporary-dance', 'korean-dance', 'street-dance'],
  'Korean-Traditional': [
    'gugak-orchestra',
    'pansori',
    'minyo',
    'changgeuk',
    'gugak-fusion', // Gigs 와 공유
  ],
  // 칩을 `Artist`(사람이 아니라 **작품·IP 개체**)가 보유하는 유일한 카테고리다 —
  // 제목의 92.7% 에 형식어가 없어 공연 단위 라벨링이 성립하지 않는다.
  // 배치 20260814-1 로 개체 22개·128건이 붙었다(커버리지 14.9%).
  // ⚠️ 실재고는 `family-kids` 뿐이고 나머지 4칩은 아직 0건이다 — 어휘 전체를 여는 선택(2026-08-14).
  // 정본: specs/web-next/concert-chip-expansion.md
  Theatre: ['family-kids', 'romantic-comedy', 'mystery-thriller', 'comedy', 'horror'],
} as const satisfies Record<EventCategoryName, readonly GenreChip[]>

// ─── 장르 칩 공연 피드 (`GET /v2/events/by-genre`) ────────────────────────────
// 정본: specs/billets-server/concert-genre-feed-api.md

/** 노출 창 경계 — `YYYY-MM-DD`(날짜 단위). 시각(timestamp) 금지가 캐시 키의 생명줄. */
const DATE_ONLY = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')

export const GetEventsByGenreQueryStringDTOSchema = z.object({
  /** 칩 comma-separated. 비우면 창 안 전체 — "안 고르면 전체가 보인다". */
  genres: z.string().optional(),
  /**
   * 어느 카테고리의 피드인가. 생략 시 `Gigs` — **기존 소비자를 그대로 두기 위한 하위호환 기본값**이다.
   * 칩 검증도 이 카테고리 스코프(`CHIP_SETS[category]`)로 좁힌다: `?category=Classic&genres=trot` 은
   * 어휘엔 있지만 그 카테고리 칩이 아니므로 400. 정본: specs/web-next/concert-chip-expansion.md
   */
  category: z.enum(EVENT_CATEGORIES).default('Gigs'),
  /**
   * 노출 창 = `[from, until]` 명시 범위(Dice `/browse?from=&until=` 모델). 과거엔 `days` 열거형
   * (7·30·90)이었다 — 자유값이 KV 캐시 키를 갈라 "읽기 캐시가 쓰기 폭탄"이 되는 걸 막으려고.
   * from/until 로 열되 그 위험은 **세 겹 완충**으로 잡는다:
   *   ① 날짜 단위(YYYY-MM-DD) 정규화 — timestamp 키 분화 차단
   *   ② 창 상한 clamp(`until - from ≤ 180일`) — 스캔·키 동시 상한 (핸들러)
   *   ③ UI 프리셋(이번주·한달·세달)이 `until = 오늘+N` 으로 계산돼 트래픽이 소수 값에 몰림
   * 기본값(from=오늘·until=from+30)·순서검증(from ≤ until)·clamp 는 핸들러가 — `new Date()` 가 사는 곳.
   */
  from: DATE_ONLY.optional(),
  until: DATE_ONLY.optional(),
  locationCityName: z.string().optional(),
  size: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
})
export type GetEventsByGenreQueryStringDTO = z.infer<typeof GetEventsByGenreQueryStringDTOSchema>

/** 매칭 근거 — 이게 없으면 추천이 블랙박스가 된다. 이 퍼널의 신뢰 축. */
export const GenreTaggedArtistDTOSchema = z.object({
  slug: z.string(),
  name: z.string(),
  genres: z.string().array(),
})
export type GenreTaggedArtistDTO = z.infer<typeof GenreTaggedArtistDTOSchema>

/**
 * 칩·아티스트는 `ConcertDTO` **안이 아니라 래퍼 필드**로 얹는다 — DTO 를 확장하면
 * 홈 피드·VenueDetail 등 모든 소비자의 스냅샷이 흔들린다.
 */
export const GenreTaggedEventDTOSchema = z.object({
  type: z.literal('concert'),
  data: ConcertDTOSchema,
  genres: z.string().array(),
  /** `ConcertLabel.format` — 장르와 직교하는 축. 아티스트는 가질 수 없는 공연 고유 속성. */
  format: z.string().nullable(),
  artists: GenreTaggedArtistDTOSchema.array(),
})
export type GenreTaggedEventDTO = z.infer<typeof GenreTaggedEventDTOSchema>

/** 커버리지를 숨기지 않는다 — "301건 중 268건만 올라온다"를 화면이 각주로 밝히게 하는 재료. */
export const GenreFeedMetaDTOSchema = z.object({
  totalInWindow: z.number(),
  labeledInWindow: z.number(),
  chipCounts: z.record(z.string(), z.number()),
})
export type GenreFeedMetaDTO = z.infer<typeof GenreFeedMetaDTOSchema>

export const GenreFeedDTOSchema = z.object({
  data: GenreTaggedEventDTOSchema.array(),
  meta: GenreFeedMetaDTOSchema,
})
export type GenreFeedDTO = z.infer<typeof GenreFeedDTOSchema>

// ─── 장르 목록 (`GET /v2/genres`) ─────────────────────────────────────────────
//
// **위 `GENRE_CHIPS` 상수를 서빙하는 API 가 아니다.** DB 는 칩을 `String[]` 로만 들고 있어
// (enum 도 FK 도 아니다) 상수를 강제하지 않고, 라벨은 손으로 쓴 SQL 배치(`/label-gigs`·
// `/label-events`)로 들어온다 — 어휘가 양방향으로 어긋날 수 있다는 뜻이다.
// 그래서 이 목록은 상수가 아니라 **실제 재고에서 파생한다**: 상수 밖 칩도 그대로 나오고,
// 라벨 배치가 안 돈 칩은 안 나온다. 소비자가 화면에 그린 칩이 곧 누르면 결과가 있는 칩이 된다.

/** `count`·`categories` 는 선언이 아니라 관측값 — 어디서 왔는지가 필드 뜻 전부다. */
export const GenreListItemDTOSchema = z.object({
  genre: z.string(),
  /**
   * 그 칩이 실제로 붙은 공연들의 `EventCategory.name` 집합. `CHIP_SETS` 역인덱스가 아니다 —
   * 배치가 엉뚱한 카테고리에 칩을 붙였으면 그것도 그대로 드러나야 이 API 가 쓸모 있다.
   * 카테고리 미지정 공연은 이 배열에 아무것도 보태지 않는다(빈 배열이 될 수 있다).
   */
  categories: z.string().array(),
  /** 공연 수. `by-genre` 의 `meta.chipCounts` 와 같은 집계 규칙(아티스트 우선·라벨 폴백). */
  count: z.number(),
})
export type GenreListItemDTO = z.infer<typeof GenreListItemDTOSchema>

export const GenreListDTOSchema = GenreListItemDTOSchema.array()
export type GenreListDTO = z.infer<typeof GenreListDTOSchema>
