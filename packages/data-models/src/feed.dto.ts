import { z } from 'zod'
import { ConcertDTOSchema } from './concert.dto'
import { UserDTOSchema } from './user.dto'
import { WorkCategorySchema, WorkRefSchema } from './work.dto'

export const FeedEntityTypes = {
  CONCERT_LIST: 'CONCERT_LIST',
  APP_FEATURE: 'APP_FEATURE',
  EDITORIAL: 'EDITORIAL',
  USER: 'USER',
  USER_POST: 'USER_POST',
  /**
   * @deprecated `EDITORIAL` 로 대체됐다. **지우지 말 것** — `surfers-root` 의
   * `wamuseum-server` feed-resolvers 가 아직 이 이름으로 Feed 를 쓴다.
   */
  BLOG_ARTICLE: 'BLOG_ARTICLE',
} as const
export const FeedDefinitions = {
  KOPIS_EVENTS_RELEASE: 'KOPIS_EVENTS_RELEASE',
  WEEKEND_EVENTS_NOTIFICATION: 'WEEKEND_EVENTS_NOTIFICATION',
  NEW_FEATURE_RELEASE: 'NEW_FEATURE_RELEASE',
  NEW_EDITORIAL_RELEASE: 'NEW_EDITORIAL_RELEASE',
  NEW_USER: 'NEW_USER',
  NEW_USER_POST: 'NEW_USER_POST',
  /** `/daily` 편 한 호. entityType 은 CONCERT_LIST 를 공유하고 이 key 로만 갈린다. */
  DAILY_EDITION_RELEASE: 'DAILY_EDITION_RELEASE',
  /**
   * @deprecated `NEW_EDITORIAL_RELEASE` 로 대체됐다. **지우지 말 것** — 두 이유다.
   *
   * 1. `wamuseum-server` 가 아직 이 key 로 `FeedDefinition` 을 connect 한다.
   * 2. **DB 에 두 row 가 다 살아 있다** (`NEW_BLOG_ARTICLE_RELEASE` 2025-12-22 ·
   *    `NEW_EDITORIAL_RELEASE` 2026-07-11). 개명이 아니라 추가였다. 그래서 이 이름을 빼면
   *    `FeedDefinitionDTOSchema.key` 가 DB 에 실재하는 row 를 거부한다.
   */
  NEW_BLOG_ARTICLE_RELEASE: 'NEW_BLOG_ARTICLE_RELEASE',
} as const

export const FeedDefinitionDTOSchema = z.object({
  id: z.string().uuid(),
  key: z.nativeEnum(FeedDefinitions),
  name: z.string(),
})
export type FeedDefinitionDTO = z.infer<typeof FeedDefinitionDTOSchema>

export const FeedConcertListDTOSchema = z.object({
  type: z.literal(FeedEntityTypes.CONCERT_LIST),
  definition: z.literal(FeedDefinitions.KOPIS_EVENTS_RELEASE),
  payload: z.object({
    title: z.string(),
    description: z.string(),
    data: ConcertDTOSchema.array(),
    createdAt: z.string().datetime(),
  }),
})
export type FeedConcertListDTO = z.infer<typeof FeedConcertListDTOSchema>

export const FeedEditorialDTOSchema = z.object({
  type: z.literal(FeedEntityTypes.EDITORIAL),
  definition: z.literal(FeedDefinitions.NEW_EDITORIAL_RELEASE),
  payload: z.object({
    title: z.string(),
    description: z.string(),
    data: z.object({
      slug: z.string(),
      category: z.string(),
      thumbnail: z.string().url(),
    }),
    createdAt: z.string().datetime(),
  }),
})
export type FeedEditorialDTO = z.infer<typeof FeedEditorialDTOSchema>

export const FeedWeekendEventsNotificationDTOSchema = z.object({
  type: z.literal(FeedEntityTypes.CONCERT_LIST),
  definition: z.literal(FeedDefinitions.WEEKEND_EVENTS_NOTIFICATION),
  payload: z.object({
    title: z.string(),
    description: z.string(),
    data: ConcertDTOSchema.array(),
    createdAt: z.string().datetime(),
  }),
})
export type FeedWeekendEventsNotificationDTO = z.infer<
  typeof FeedWeekendEventsNotificationDTOSchema
>

/**
 * `/daily` 편 한 호 — **알림·피드 목록이 보는 렌즈**.
 *
 * `type` 이 CONCERT_LIST 인 건 의도다(결정 14). 알림 카드가 종류마다 모양을 바꾸지 않고
 * 「무엇이 더 붙는가」로만 갈리므로, 같은 옷을 입히면 web-next 를 안 건드리고도 편 알림이
 * 그려진다. 갈리는 축은 `definition` 하나뿐이다.
 *
 * 저장된 payload 는 이보다 넓다 — 편 본문(`DailyEditionFeedPayloadSchema.edition`)이 같은
 * 칸에 함께 들어 있고, zod 가 모르는 키를 버리므로 여기선 조용히 떨어진다. 알림 목록에
 * 30KB 짜리 본문이 실려 나가지 않는 게 그 덕이다. 본문을 읽는 건 `/v1/daily/*` 다.
 */
export const FeedDailyEditionDTOSchema = z.object({
  type: z.literal(FeedEntityTypes.CONCERT_LIST),
  definition: z.literal(FeedDefinitions.DAILY_EDITION_RELEASE),
  payload: z.object({
    title: z.string(),
    description: z.string(),
    data: ConcertDTOSchema.array(),
    createdAt: z.string().datetime(),
  }),
})
export type FeedDailyEditionDTO = z.infer<typeof FeedDailyEditionDTOSchema>

export const FeedAppFeatureDTOSchema = z.object({
  type: z.literal(FeedEntityTypes.APP_FEATURE),
  definition: z.literal(FeedDefinitions.NEW_FEATURE_RELEASE),
  payload: z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.string().datetime(),
    link: z.string().url(),
  }),
})
export type FeedAppFeatureDTO = z.infer<typeof FeedAppFeatureDTOSchema>

export const FeedDTOSchema = z.object({
  id: z.string().uuid(),
  content: z.discriminatedUnion('definition', [
    FeedConcertListDTOSchema,
    FeedAppFeatureDTOSchema,
    FeedEditorialDTOSchema,
    z.object({
      type: z.literal('USER'),
      definition: z.literal(FeedDefinitions.NEW_USER),
      payload: UserDTOSchema,
    }),
    z.object({
      type: z.literal('USER_POST'),
      definition: z.literal(FeedDefinitions.NEW_USER_POST),
      //   @TODO: implement payload
    }),
    FeedWeekendEventsNotificationDTOSchema,
    FeedDailyEditionDTOSchema,
  ]),
  createdAt: z.string().datetime(),
})
export type FeedDTO = z.infer<typeof FeedDTOSchema>

// ─────────────────────────────────────────────────────────────────────────────
// SNS 홈 피드(`/`) 의 타입 계약 — `docs/kanban/web-sns-home/data-models.md` 카드.
//
// 위 `FeedDTO` 의 union(`definition` discriminator)과 *섞이지 않는다*: 그쪽은 billets `/feed`
// 아카이브 surface 전용이고, 아래 `HomePost*` 는 비평/SNS 홈 surface 전용 — discriminator 도
// `variant` 로 분리. 두 surface 가 공유하는 건 `WorkRef.id` 식별자뿐.
//
// web-next 의 로컬 미러 `apps/web-next/src/lib/home-feed/types.ts` 와 *동형* 으로 둔다 — UI 두
// 카드(chrome-3pane · feed-stream)는 mock-first 로 먼저 검증하고, 서버 endpoint 가 이 모양으로
// 내려주면 fetcher 만 갈아끼운다.
// ─────────────────────────────────────────────────────────────────────────────

/** chip 필터 축 — 작품 카테고리 ∪ Mind(에세이) ∪ all. */
export const FeedCategorySchema = z.union([WorkCategorySchema, z.literal('Mind'), z.literal('all')])
export type FeedCategory = z.infer<typeof FeedCategorySchema>

export const AuthorDTOSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('editorial'),
    handle: z.union([z.literal('coldsurf'), z.literal('paulchoi'), z.literal('stage')]),
    display: z.string(),
    /** 디자인의 `.star` ★ — 편집 인증 표지자. */
    badge: z.literal('★').optional(),
  }),
  z.object({
    kind: z.literal('user'),
    id: z.string(),
    handle: z.string(),
    display: z.string(),
    /** 아바타 이니셜 ("이서"·"KD"). */
    avatarInitials: z.string(),
  }),
])
export type AuthorDTO = z.infer<typeof AuthorDTOSchema>

/** 1줄 hook — 디자인의 `<span class="r">` 빨강 강조 단어를 typed 으로. */
export const PostHookSchema = z.object({
  text: z.string(),
  /** text 의 [from, to) 구간을 빨강 강조. 여러 구간 가능. */
  emphasis: z.array(z.object({ from: z.number(), to: z.number() })).optional(),
})
export type PostHook = z.infer<typeof PostHookSchema>

export const PostInteractionsSchema = z.object({
  likes: z.number(),
  likedByMe: z.boolean(),
  comments: z.number(),
  saved: z.number(),
  savedByMe: z.boolean(),
})
export type PostInteractions = z.infer<typeof PostInteractionsSchema>

/** 모든 포스트 공통 메타. discriminated union 합류 전 각 변형이 spread 한다. */
export const PostBaseShape = {
  postId: z.string(),
  author: AuthorDTOSchema,
  /** "방금" · "12분 전" · "2026.07.18" — 디자인의 자유 표기 그대로. ISO 강제 X. */
  publishedAt: z.string(),
  interactions: PostInteractionsSchema,
  /** chip 필터링 축. 작품 포스트는 work.category 와 동일, shelf 는 'all'. */
  category: FeedCategorySchema,
}

export const MediaAspectSchema = z.union([
  z.literal('1:1'),
  z.literal('4:5'),
  z.literal('16:9'),
  z.literal('3:2'),
  z.literal('2:3'),
])
export type MediaAspect = z.infer<typeof MediaAspectSchema>

export const PostVariants = {
  PICK_SPOTLIGHT: 'PICK_SPOTLIGHT',
  REVIEW_MEDIA: 'REVIEW_MEDIA',
  TAKE_TEXT: 'TAKE_TEXT',
  STAGE_CONCERT: 'STAGE_CONCERT',
  SHELF_GRID: 'SHELF_GRID',
  ESSAY_MIND: 'ESSAY_MIND',
} as const
export const PostVariantSchema = z.nativeEnum(PostVariants)
export type PostVariant = z.infer<typeof PostVariantSchema>

export const PickSpotlightPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.PICK_SPOTLIGHT),
  work: WorkRefSchema,
  /** №014. */
  pickNumber: z.number(),
  cover: z.object({
    url: z.string(),
    placeholder: z.string().optional(),
    aspectRatio: z.union([z.literal('1:1'), z.literal('4:5'), z.literal('16:9')]),
  }),
  hook: PostHookSchema,
  detailHref: z.string(),
})
export type PickSpotlightPostDTO = z.infer<typeof PickSpotlightPostSchema>

export const ReviewMediaPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.REVIEW_MEDIA),
  work: WorkRefSchema,
  media: z.object({
    url: z.string(),
    placeholder: z.string().optional(),
    aspectRatio: z.union([z.literal('16:9'), z.literal('4:5'), z.literal('1:1')]),
  }),
  hook: PostHookSchema,
  detailHref: z.string(),
})
export type ReviewMediaPostDTO = z.infer<typeof ReviewMediaPostSchema>

export const TakeTextPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.TAKE_TEXT),
  work: WorkRefSchema,
  /** hook 동형 — Take 의 인용도 결국 1줄 hook 의 변형. */
  quote: PostHookSchema,
  detailHref: z.string(),
})
export type TakeTextPostDTO = z.infer<typeof TakeTextPostSchema>

export const StageConcertPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.STAGE_CONCERT),
  /** category='Concerts'. */
  work: WorkRefSchema,
  media: z.object({
    url: z.string(),
    placeholder: z.string().optional(),
    aspectRatio: MediaAspectSchema,
  }),
  /** date 는 ISO 강제 X — 디자인의 `2026.07.18` 자유 문자열 그대로. */
  schedule: z.object({ date: z.string(), venue: z.string() }),
  interestCount: z.number(),
  interestedByMe: z.boolean(),
  hook: PostHookSchema,
  detailHref: z.string(),
})
export type StageConcertPostDTO = z.infer<typeof StageConcertPostSchema>

export const ShelfGridPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.SHELF_GRID),
  curationTitle: z.string(),
  curationSubtitle: z.string(),
  /** 정확히 6칸 — 디자인의 시각적 약속. */
  cells: z
    .array(
      z.object({
        work: WorkRefSchema,
        thumb: z.string(),
        placeholder: z.string().optional(),
      }),
    )
    .length(6),
  /** "14편 전체 보기" 의 14. */
  totalCount: z.number(),
  shelfHref: z.string(),
})
export type ShelfGridPostDTO = z.infer<typeof ShelfGridPostSchema>

export const EssayMindPostSchema = z.object({
  ...PostBaseShape,
  variant: z.literal(PostVariants.ESSAY_MIND),
  title: z.string(),
  /** "★ From Mind · Featured". */
  eyebrow: z.string(),
  pullQuote: z.string(),
  detailHref: z.string(),
})
export type EssayMindPostDTO = z.infer<typeof EssayMindPostSchema>

export const HomePostSchema = z.discriminatedUnion('variant', [
  PickSpotlightPostSchema,
  ReviewMediaPostSchema,
  TakeTextPostSchema,
  StageConcertPostSchema,
  ShelfGridPostSchema,
  EssayMindPostSchema,
])
export type HomePostDTO = z.infer<typeof HomePostSchema>

/** fnote — 포스트 아님. 서버가 위치를 *결정* 한다(클라가 가짜로 끼우지 않음). */
export const HomeFeedNoteSchema = z.object({
  itemType: z.literal('NOTE'),
  kind: z.union([z.literal('KEEP_SCROLLING'), z.literal('CAUGHT_UP')]),
  kicker: z.string(),
  body: z.string(),
})
export type HomeFeedNoteDTO = z.infer<typeof HomeFeedNoteSchema>

/** 스트림 아이템 = 포스트 ∪ 노트. 포스트는 `variant`, 노트는 `itemType:'NOTE'` 로 분기. */
export const HomeFeedItemSchema = z.union([HomePostSchema, HomeFeedNoteSchema])
export type HomeFeedItemDTO = z.infer<typeof HomeFeedItemSchema>

export function isHomeFeedNote(item: HomeFeedItemDTO): item is HomeFeedNoteDTO {
  return (item as HomeFeedNoteDTO).itemType === 'NOTE'
}

export const FeedTabSchema = z.union([z.literal('foryou'), z.literal('following')])
export type FeedTab = z.infer<typeof FeedTabSchema>

export const HomeFeedQuerySchema = z.object({
  tab: FeedTabSchema,
  category: FeedCategorySchema,
  cursor: z.string().optional(),
  size: z.coerce.number().int().min(0).max(100).optional(),
})
export type HomeFeedQueryDTO = z.infer<typeof HomeFeedQuerySchema>

export const HomeFeedPageSchema = z.object({
  items: z.array(HomeFeedItemSchema),
  nextCursor: z.string().optional(),
})
export type HomeFeedPageDTO = z.infer<typeof HomeFeedPageSchema>
