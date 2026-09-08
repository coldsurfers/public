import type {
  Article,
  Book,
  BreadcrumbList,
  Event,
  Graph,
  Movie,
  MusicAlbum,
  MusicEvent,
  MusicRecording,
  Organization,
  Person,
  Review,
  Thing,
  WebSite,
} from 'schema-dts'

export type Lang = 'ko' | 'en'

export type SeoImage = {
  /** Absolute URL or path starting with `/`. */
  path: string
  width?: number
  height?: number
  type?: string
  alt?: string
}

export type ArticleMeta = {
  /** ISO 8601 timestamp. */
  publishedTime: string
  /** ISO 8601 timestamp. */
  modifiedTime?: string
  /**
   * Single author or multiple writers. A string keeps the legacy single-author
   * behavior; an array emits one `article:author` meta per writer and a
   * `Person[]` in the Article/Review JSON-LD node.
   */
  author?: string | string[]
  section?: string
  tags?: string[]
}

/**
 * apps/web `WorkType` 와 1:1. 도메인 타입을 패키지로 끌어오지 않으려고 문자열 리터럴로 받는다.
 * `buildJsonLd` 가 schema.org `@type` 으로 매핑한다 (albums→MusicAlbum 등).
 */
export type CreativeWorkKind = 'albums' | 'tracks' | 'concerts' | 'films' | 'books' | 'events'

/** 작품 노드 입력 — Review.itemReviewed · CreativeWork 페이지 공용. */
export type JsonLdWork = {
  kind: CreativeWorkKind
  name: string
  /** 아티스트 / 저자 / 감독 — kind 에 따라 byArtist · author · director · performer 로 매핑. */
  by?: string
  /** 발매·개최 연도. `String()` 으로 datePublished/startDate 에 들어간다. */
  year?: number | string
  /** Path(`/...`) 또는 절대 URL. */
  image?: string
  /** 작품 페이지 path(`/...`) 또는 절대 URL. */
  url?: string
  /** 외부 출처 — bandcamp · spotify · imdb 등. */
  sameAs?: string[]
}

export type JsonLdRating = { value: number; best?: number; worst?: number }

export type JsonLdEventOffer = {
  price: number
  currency: string
  /** Path(`/...`) 또는 절대 URL. */
  url: string
  /** ISO 8601 — 티켓 오픈 시각. */
  validFrom: string
  name?: string
}

/**
 * 페이지 본체가 곧 그 공연인 경우의 풀 Event 노드 입력. 얕은 `JsonLdWork('concerts')`(참조용)와
 * 달리 venue(geo)·offers·organizer 까지 채워 Google Event 리치 결과 자격을 충족한다.
 */
export type JsonLdEvent = {
  name: string
  /** 이벤트 페이지 path(`/...`) 또는 절대 URL. */
  url: string
  /** ISO 8601 — 연도-only 금지(리치 결과 유효성 실패). */
  startDate: string
  /** ISO 8601 */
  endDate?: string
  venue: {
    name: string
    address: string
    latitude: number
    longitude: number
  }
  /** Path(`/...`) 또는 절대 URL 목록. */
  images?: string[]
  description?: string
  offers?: JsonLdEventOffer[]
  /** 주최자명. 미지정 시 `venue.name` 으로 대체. */
  organizer?: string
}

/**
 * 페이지에 emit 할 구조화 데이터 디스크립터. `buildJsonLd` 가 단일 `@graph` 로 합쳐 직렬화한다.
 * publisher(Organization) · editor(Person) base 노드는 매 페이지 inline 되어 `@id` 참조를 해소한다.
 */
export type JsonLd =
  | { type: 'WebSite' }
  /** `input.article` 에서 파생 — article 없으면 무시. */
  | { type: 'Article' }
  | { type: 'Review'; itemReviewed: JsonLdWork; rating?: JsonLdRating }
  | { type: 'CreativeWork'; item: JsonLdWork }
  /** 페이지 본체가 곧 그 공연 — venue/offers 까지 갖춘 풀 MusicEvent. */
  | { type: 'EventPage'; event: JsonLdEvent }
  | { type: 'Breadcrumb'; items: { name: string; path: string }[] }

export type PageSeoInput = {
  title: string
  description: string
  path: string
  lang?: Lang
  /** Alternate language versions for this page. Emits hreflang link tags. */
  alternates?: { lang: Lang; path: string }[]
  /** When set, og:type switches to `article` and article:* tags are emitted. */
  article?: ArticleMeta
  /** Override the default OG/Twitter share image for this page. */
  image?: SeoImage
  /** Per-page keywords. Merged with `SiteConfig.keywords` into a `keywords` meta. */
  keywords?: string[]
  /** Structured data (JSON-LD) to emit for this page. Build-time consumers only. */
  jsonLd?: JsonLd[]
  /**
   * Per-page App Links deep-link URLs. App identity(store id/package/name)는 `SiteConfig.appLinks`
   * 에서 오고, 여기선 이 페이지 콘텐츠로 가는 딥링크 URL 만 준다. `SiteConfig.appLinks` 가 없으면 무시.
   */
  appLinks?: { iosUrl?: string; androidUrl?: string }
}

export type SiteConfig = {
  /** Display name appended to every page title. */
  name: string
  /** Origin used to resolve absolute URLs. Trailing slash is normalized. */
  baseUrl: string
  /** Default OG/Twitter image used when a page does not override it. */
  defaultImage?: SeoImage
  /** Path emitted as `og:logo` (Schema.org / LinkedIn extension). */
  logoPath?: string
  /** Override locale strings for og:locale. Defaults: ko → ko_KR, en → en_US. */
  locales?: Partial<Record<Lang, string>>
  /** Site-wide keywords merged into every page's `keywords` meta. */
  keywords?: string[]
  /**
   * Cache-busting token appended as `?v=<assetVersion>` to *own-domain* OG/Twitter
   * image URLs (paths, not external `http` URLs). Bump it when an image is replaced
   * in place under the same filename so social scrapers (Threads/Slack/iMessage 등)
   * treat it as a new URL instead of serving their stale cache.
   */
  assetVersion?: string
  /** Publishing organization — emitted as the `Organization` JSON-LD node. */
  publisher?: {
    name: string
    url?: string
    logoPath?: string
    sameAs?: string[]
  }
  /** Editor — emitted as the `Person` JSON-LD node, referenced as article author. */
  editor?: { name: string; url?: string; sameAs?: string[] }
  /**
   * Site icons — emitted as `link[rel=icon|shortcut icon|apple-touch-icon]`. Each value is a
   * path(`/...`) or absolute URL resolved through `absoluteUrl`. Unlike OG images, icons are
   * *not* cache-busted with `assetVersion` (they rarely change in place).
   */
  icons?: { icon?: string; shortcut?: string; apple?: string }
  /**
   * 네이티브 앱 아이덴티티 — 존재 시 `al:ios:*` / `al:android:*` (Facebook App Links) 메타를 emit.
   * 페이지별 딥링크 URL 은 `PageSeoInput.appLinks` 에서 주입한다. Twitter `app` 카드는 쓰지 않는다
   * (이미지 카드 우선 — 포스터 미리보기 CTR 보존). 딥링크는 카드 종류와 무관하게 동작한다.
   */
  appLinks?: {
    ios?: { appStoreId: string; appName: string }
    android?: { packageName: string; appName?: string }
  }
}

export type SeoMeta = { name?: string; property?: string; content: string }
export type SeoLink = { rel: string; href: string; hreflang?: string }
export type SeoScript = { type: 'application/ld+json'; innerHTML: string }

export type SeoTags = {
  title: string
  htmlLang: Lang
  meta: SeoMeta[]
  link: SeoLink[]
  /** JSON-LD `<script>` tags. Empty unless `input.jsonLd` is set. */
  script: SeoScript[]
}

const DEFAULT_LOCALES: Record<Lang, string> = {
  ko: 'ko_KR',
  en: 'en_US',
}

const SCHEMA_CONTEXT = 'https://schema.org'

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

/** Resolve a value that may be a path(`/...`) or an already-absolute URL. */
function absoluteUrl(base: string, value: string): string {
  return value.startsWith('http') ? value : joinUrl(base, value)
}

/**
 * Append `?v=<version>` (or `&v=`) for cache-busting. No-op when version is empty.
 * `external` skips the param entirely — we don't control third-party CDN URLs
 * (signed poster URLs could break) and only want to bust our own re-uploaded assets.
 */
function withAssetVersion(url: string, version: string | undefined, external: boolean): string {
  if (!version || external) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`
}

/**
 * Absolute *page* (route) URL.
 *
 * 과거 Next.js (`trailingSlash: true` + directory-index 호스팅) 시절엔 모든 page URL 에
 * `/` 를 강제로 붙여 canonical 과 sitemap 을 호스트 redirect 와 정합시켰지만, TSS +
 * Cloudflare Workers SSR 로 이관 후엔 라우트가 slash 없이 서빙된다 (`/event/foo` 는 200,
 * `/event/foo/` 는 의도된 canonical 이 아님). 따라서 `absoluteUrl` 결과를 그대로 둔다.
 */
function pageUrl(base: string, value: string): string {
  return absoluteUrl(base, value)
}

type JsonLdContext = {
  url: string
  fullTitle: string
  imageUrl?: string
  lang: Lang
}

function orgNode(site: SiteConfig, orgId: string): Organization | null {
  const p = site.publisher
  if (!p) return null
  return {
    '@type': 'Organization',
    '@id': orgId,
    name: p.name,
    url: p.url ?? site.baseUrl.replace(/\/$/, ''),
    logo: p.logoPath ? joinUrl(site.baseUrl, p.logoPath) : undefined,
    sameAs: p.sameAs,
  } satisfies Organization
}

/**
 * `ArticleMeta.author` (string | string[]) → schema.org author. 단일 string 은 `Person` 하나,
 * 배열은 `Person[]` 로. `site.editor` 가 있으면 호출부에서 editor `@id` 가 우선한다(이 헬퍼는 보조).
 */
function authorNode(author: string | string[] | undefined): Person | Person[] | undefined {
  if (!author) return undefined
  if (Array.isArray(author)) {
    if (author.length === 0) return undefined
    return author.map((name) => ({ '@type': 'Person', name }) satisfies Person)
  }
  return { '@type': 'Person', name: author } satisfies Person
}

function personNode(site: SiteConfig, editorId: string): Person | null {
  const e = site.editor
  if (!e) return null
  return {
    '@type': 'Person',
    '@id': editorId,
    name: e.name,
    url: e.url,
    sameAs: e.sameAs,
  } satisfies Person
}

function websiteNode(
  site: SiteConfig,
  ctx: JsonLdContext,
  websiteId: string,
  orgId: string,
): WebSite {
  return {
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    url: site.baseUrl.replace(/\/$/, ''),
    inLanguage: ctx.lang,
    publisher: site.publisher ? { '@id': orgId } : undefined,
  } satisfies WebSite
}

function articleNode(
  input: PageSeoInput,
  site: SiteConfig,
  ctx: JsonLdContext,
  orgId: string,
  editorId: string,
): Article | null {
  const a = input.article
  if (!a) return null
  return {
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: ctx.url,
    mainEntityOfPage: ctx.url,
    inLanguage: ctx.lang,
    datePublished: a.publishedTime,
    dateModified: a.modifiedTime,
    image: ctx.imageUrl,
    articleSection: a.section,
    keywords: a.tags,
    author: site.editor ? { '@id': editorId } : authorNode(a.author),
    publisher: site.publisher ? { '@id': orgId } : undefined,
  } satisfies Article
}

/**
 * `JsonLdWork` → schema.org 작품 노드. kind 에 따라 @type 과 creator 프로퍼티를 매핑한다.
 * creator(`by`)는 문자열이 아니라 `MusicGroup`/`Person` 객체로 감싸야 schema-dts 가 받는다.
 */
function workNode(work: JsonLdWork, base: string): Thing {
  const name = work.name
  const image = work.image ? absoluteUrl(base, work.image) : undefined
  const url = work.url ? pageUrl(base, work.url) : undefined
  const sameAs = work.sameAs?.length ? work.sameAs : undefined
  const year = work.year != null ? String(work.year) : undefined
  const musicGroup = work.by ? ({ '@type': 'MusicGroup', name: work.by } as const) : undefined
  const person = work.by ? ({ '@type': 'Person', name: work.by } as const) : undefined

  switch (work.kind) {
    case 'albums':
      return {
        '@type': 'MusicAlbum',
        name,
        byArtist: musicGroup,
        image,
        url,
        sameAs,
        datePublished: year,
      } satisfies MusicAlbum
    case 'tracks':
      return {
        '@type': 'MusicRecording',
        name,
        byArtist: musicGroup,
        image,
        url,
        sameAs,
      } satisfies MusicRecording
    case 'concerts':
      return {
        '@type': 'MusicEvent',
        name,
        performer: musicGroup,
        image,
        url,
        sameAs,
        startDate: year,
      } satisfies MusicEvent
    case 'events':
      return {
        '@type': 'Event',
        name,
        performer: musicGroup,
        image,
        url,
        sameAs,
        startDate: year,
      } satisfies Event
    case 'films':
      return {
        '@type': 'Movie',
        name,
        director: person,
        image,
        url,
        sameAs,
        datePublished: year,
      } satisfies Movie
    case 'books':
      return {
        '@type': 'Book',
        name,
        author: person,
        image,
        url,
        sameAs,
        datePublished: year,
      } satisfies Book
  }
}

function reviewNode(
  itemReviewed: JsonLdWork,
  rating: JsonLdRating | undefined,
  input: PageSeoInput,
  site: SiteConfig,
  ctx: JsonLdContext,
  base: string,
  orgId: string,
  editorId: string,
): Review {
  const a = input.article
  return {
    '@type': 'Review',
    name: ctx.fullTitle,
    reviewBody: input.description,
    url: ctx.url,
    inLanguage: ctx.lang,
    datePublished: a?.publishedTime,
    author: site.editor ? { '@id': editorId } : authorNode(a?.author),
    publisher: site.publisher ? { '@id': orgId } : undefined,
    itemReviewed: workNode(itemReviewed, base),
    reviewRating: rating
      ? {
          '@type': 'Rating',
          ratingValue: rating.value,
          bestRating: rating.best,
          worstRating: rating.worst,
        }
      : undefined,
  } satisfies Review
}

function breadcrumbNode(items: { name: string; path: string }[], base: string): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: pageUrl(base, it.path),
    })),
  } satisfies BreadcrumbList
}

/**
 * `JsonLdEvent` → 풀 `MusicEvent` 노드. venue(Place+GeoCoordinates) · offers(Offer) · organizer
 * 까지 채워 Google Event 리치 결과 자격을 충족한다. `@graph` 노드라 `@context` 는 붙이지 않는다.
 */
function eventNode(event: JsonLdEvent, base: string): MusicEvent {
  return {
    '@type': 'MusicEvent',
    name: event.name,
    url: pageUrl(base, event.url),
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: event.venue.address,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.venue.latitude,
        longitude: event.venue.longitude,
      },
    },
    image: event.images?.length ? event.images.map((img) => absoluteUrl(base, img)) : undefined,
    description: event.description,
    offers: event.offers?.length
      ? event.offers.map((offer) => ({
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: offer.price,
          priceCurrency: offer.currency,
          url: absoluteUrl(base, offer.url),
          validFrom: offer.validFrom,
          name: offer.name,
        }))
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: event.organizer ?? event.venue.name,
    },
  } satisfies MusicEvent
}

/**
 * 페이지 디스크립터 → 단일 `@graph` JSON-LD `<script>`.
 * publisher/editor base 노드를 항상 prepend 해 페이지 단위로 `@id` 참조가 해소되게 한다.
 */
function buildJsonLd(input: PageSeoInput, site: SiteConfig, ctx: JsonLdContext): SeoScript[] {
  const descriptors = input.jsonLd ?? []
  if (descriptors.length === 0) return []

  const base = site.baseUrl.replace(/\/$/, '')
  const orgId = `${base}/#org`
  const editorId = `${base}/#editor`
  const websiteId = `${base}/#website`

  const pageNodes: Thing[] = []
  for (const d of descriptors) {
    switch (d.type) {
      case 'WebSite':
        pageNodes.push(websiteNode(site, ctx, websiteId, orgId))
        break
      case 'Article': {
        const node = articleNode(input, site, ctx, orgId, editorId)
        if (node) pageNodes.push(node)
        break
      }
      case 'Review':
        pageNodes.push(
          reviewNode(d.itemReviewed, d.rating, input, site, ctx, base, orgId, editorId),
        )
        break
      case 'CreativeWork':
        pageNodes.push(workNode(d.item, base))
        break
      case 'EventPage':
        pageNodes.push(eventNode(d.event, base))
        break
      case 'Breadcrumb':
        pageNodes.push(breadcrumbNode(d.items, base))
        break
    }
  }
  if (pageNodes.length === 0) return []

  const baseNodes: Thing[] = []
  const org = orgNode(site, orgId)
  if (org) baseNodes.push(org)
  const person = personNode(site, editorId)
  if (person) baseNodes.push(person)

  const graph = {
    '@context': SCHEMA_CONTEXT,
    '@graph': [...baseNodes, ...pageNodes],
  } satisfies Graph

  return [{ type: 'application/ld+json', innerHTML: JSON.stringify(graph) }]
}

export function buildSeoTags(input: PageSeoInput, site: SiteConfig): SeoTags {
  const lang: Lang = input.lang ?? 'ko'
  // 라우트 측에서 이미 브랜드 suffix(`… | COLDSURF 공연 정보`, `… — COLDSURF`, `Engineering — COLDSURF`)를
  // 직접 박은 경우, 여기서 다시 `| ${site.name}` 을 더하면 `... | COLDSURF 공연 정보 | COLDSURF` 처럼 두 번 노출된다.
  // title 안에 site.name 토큰이 이미 등장하면 그대로 둔다 — 라우트의 의도를 보존하면서 중복만 제거.
  const titleHasBrand = new RegExp(`\\b${escapeRegExp(site.name)}\\b`).test(input.title)
  const fullTitle = titleHasBrand ? input.title : `${input.title} | ${site.name}`
  const url = pageUrl(site.baseUrl, input.path)
  const alternates = input.alternates ?? []
  const locales = { ...DEFAULT_LOCALES, ...site.locales }

  const link: SeoLink[] = [{ rel: 'canonical', href: url }]
  if (alternates.length > 0) {
    link.push({ rel: 'alternate', hreflang: lang, href: url })
    for (const alt of alternates) {
      link.push({
        rel: 'alternate',
        hreflang: alt.lang,
        href: pageUrl(site.baseUrl, alt.path),
      })
    }
    // x-default points at the primary (Korean) language when present.
    const xDefault = alternates.find((a) => a.lang === 'ko')?.path ?? input.path
    link.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: pageUrl(site.baseUrl, xDefault),
    })
  }

  // Site icons. Resolved through `absoluteUrl` (path or absolute URL) — no `assetVersion`
  // cache-bust (icons rarely change in place). `SiteConfig.icons` is the single source of truth;
  // the Next adapter re-maps these back into `Metadata.icons`.
  if (site.icons?.icon) {
    link.push({
      rel: 'icon',
      href: absoluteUrl(site.baseUrl, site.icons.icon),
    })
  }
  if (site.icons?.shortcut) {
    link.push({
      rel: 'shortcut icon',
      href: absoluteUrl(site.baseUrl, site.icons.shortcut),
    })
  }
  if (site.icons?.apple) {
    link.push({
      rel: 'apple-touch-icon',
      href: absoluteUrl(site.baseUrl, site.icons.apple),
    })
  }

  const meta: SeoMeta[] = [
    { name: 'description', content: input.description },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: input.description },
    { property: 'og:type', content: input.article ? 'article' : 'website' },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: site.name },
    { property: 'og:locale', content: locales[lang] },
  ]

  const keywords = [...new Set([...(input.keywords ?? []), ...(site.keywords ?? [])])]
  if (keywords.length > 0) {
    meta.push({ name: 'keywords', content: keywords.join(', ') })
  }

  const image = input.image ?? site.defaultImage
  // SeoImage.path 는 doc 상 "절대 URL 또는 `/` 시작 path" — venue 포스터처럼 외부 CDN 풀
  // URL 도 받기 위해 absoluteUrl(http 접두면 그대로) 로 통과시킨다.
  // 자체 도메인 자산만 `?v=` cache-bust — 외부 http URL 은 건드리지 않는다.
  const imageUrl = image
    ? withAssetVersion(
        absoluteUrl(site.baseUrl, image.path),
        site.assetVersion,
        image.path.startsWith('http'),
      )
    : undefined
  if (image && imageUrl) {
    meta.push({ property: 'og:image', content: imageUrl })
    if (image.type) meta.push({ property: 'og:image:type', content: image.type })
    if (image.width) meta.push({ property: 'og:image:width', content: String(image.width) })
    if (image.height) meta.push({ property: 'og:image:height', content: String(image.height) })
    if (image.alt) meta.push({ property: 'og:image:alt', content: image.alt })
    meta.push({ name: 'twitter:image', content: imageUrl })
    if (image.alt) meta.push({ name: 'twitter:image:alt', content: image.alt })
  }

  if (site.logoPath) {
    meta.push({
      property: 'og:logo',
      content: joinUrl(site.baseUrl, site.logoPath),
    })
  }

  // summary_large_image (1.91:1) 에서 잘리지 않을 만큼 가로로 긴 이미지일 때만 큰 카드로 노출.
  // 정사각형 이하 비율은 summary (작은 카드)로 떨어뜨려 안전하게 보여준다.
  const isWideImage =
    !!image && !!image.width && !!image.height && image.width >= image.height * 1.5
  const twitterCard = isWideImage ? 'summary_large_image' : 'summary'
  meta.push(
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: input.description },
  )

  for (const alt of alternates) {
    if (alt.lang !== lang) {
      meta.push({
        property: 'og:locale:alternate',
        content: locales[alt.lang],
      })
    }
  }

  if (input.article) {
    meta.push({
      property: 'article:published_time',
      content: input.article.publishedTime,
    })
    if (input.article.modifiedTime) {
      meta.push({
        property: 'article:modified_time',
        content: input.article.modifiedTime,
      })
    }
    if (input.article.author) {
      const authors = Array.isArray(input.article.author)
        ? input.article.author
        : [input.article.author]
      for (const author of authors) {
        meta.push({ property: 'article:author', content: author })
      }
    }
    if (input.article.section) {
      meta.push({
        property: 'article:section',
        content: input.article.section,
      })
    }
    for (const tag of input.article.tags ?? []) {
      meta.push({ property: 'article:tag', content: tag })
    }
  }

  // App Links (al:*) — 앱 아이덴티티는 site, 딥링크 URL 은 페이지에서. Twitter app 카드는 의도적으로
  // 쓰지 않는다(이미지 카드 우선) — al:* 는 카드 종류와 무관하게 네이티브 앱 오픈을 동작시킨다.
  if (site.appLinks?.ios) {
    meta.push({
      property: 'al:ios:app_store_id',
      content: site.appLinks.ios.appStoreId,
    })
    meta.push({
      property: 'al:ios:app_name',
      content: site.appLinks.ios.appName,
    })
    if (input.appLinks?.iosUrl) {
      meta.push({ property: 'al:ios:url', content: input.appLinks.iosUrl })
    }
  }
  if (site.appLinks?.android) {
    meta.push({
      property: 'al:android:package',
      content: site.appLinks.android.packageName,
    })
    if (site.appLinks.android.appName) {
      meta.push({
        property: 'al:android:app_name',
        content: site.appLinks.android.appName,
      })
    }
    if (input.appLinks?.androidUrl) {
      meta.push({
        property: 'al:android:url',
        content: input.appLinks.androidUrl,
      })
    }
  }

  const script = buildJsonLd(input, site, { url, fullTitle, imageUrl, lang })

  return { title: fullTitle, htmlLang: lang, meta, link, script }
}
