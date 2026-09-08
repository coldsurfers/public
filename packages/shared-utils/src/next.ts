// `next/types` (not `next`) — 본 패키지 tsconfig 은 `moduleResolution: node` 라 next 의 conditional
// `exports` 를 못 읽는다. 물리 파일 `next/types.d.ts` 로 직접 가야 Metadata 가 해소된다(blog 와 동일).
import type { Metadata } from 'next/types'
import {
  buildSeoTags,
  type PageSeoInput,
  type SeoLink,
  type SeoMeta,
  type SeoTags,
  type SiteConfig,
} from './metadata'

// ─────────────────────────────────────────────────────────────────────────────
// Next.js App Router metadata adapter
//
// `createSeoHead` (`/react`) 의 Next 짝꿍. 같은 "config 1회 바인딩 → 페이지 입력 1개" 클로저 패턴이되,
// 출력 타깃이 head-descriptor 배열이 아니라 Next App Router 의 `Metadata`(중첩) 객체다.
//
//   const seo = createNextMetadata({ ...SITE, baseUrl })
//   export function generateMetadata(): Metadata { return seo({ path: '/about', title, description }) }
//
// 어댑터는 순수 매핑이다 — `buildSeoTags` 가 만든 평평한 `SeoTags` 만 중첩 `Metadata` 로 역포장하며,
// 새 SEO 정책은 더하지 않는다(예외: `createSeoHead` 와 동일 시맨틱의 robots override).
//
// JSON-LD 는 `Metadata` 에 담을 필드가 없다 → `generateMetadata` 와 별개로 `buildSeoScripts` 로
// raw `<script>` innerHTML 을 따로 받아 layout 에서 직접 박는다 (spec §3-5 경로 A).
// ─────────────────────────────────────────────────────────────────────────────

export type NextMetadataInput = PageSeoInput & { robots?: string }

/**
 * `SiteConfig` 를 한 번 바인딩해, 라우트의 `generateMetadata` 가 단일 입력으로 호출하는
 * `(input) => Metadata` 를 만든다. `robots` 만 페이지 override (noindex 라우트).
 */
export function createNextMetadata(site: SiteConfig): (input: NextMetadataInput) => Metadata {
  return (input) => {
    const { robots, ...page } = input
    return toMetadata(buildSeoTags(page, site), robots)
  }
}

/**
 * JSON-LD 주입 헬퍼 (spec §3-5 경로 A). Next `Metadata` 에는 구조화 데이터 필드가 없으므로,
 * layout 이 `<script type="application/ld+json" dangerouslySetInnerHTML>` 로 박을 raw 문자열
 * 배열을 따로 돌려준다. `input.jsonLd` 가 비어 있으면 빈 배열.
 */
export function buildSeoScripts(input: PageSeoInput, site: SiteConfig): string[] {
  return buildSeoTags(input, site).script.map((s) => s.innerHTML)
}

type OgImage = {
  url: string
  type?: string
  width?: number
  height?: number
  alt?: string
}

/**
 * flat `SeoTags` → 중첩 `Metadata`. 매핑 규칙은 spec §3-1 표 그대로.
 *
 * openGraph / twitter / appLinks 는 Next 의 판별 union·필수 필드(예: appLinks.ios.url)가 평평한
 * 엔진 출력보다 좁아, 누적 객체를 만든 뒤 경계에서 한 번만 `as` 로 역포장한다(재구성 경계 한정 캐스팅).
 */
function toMetadata(tags: SeoTags, robotsOverride?: string): Metadata {
  const metadata: Metadata = { title: tags.title }

  // biome-ignore lint/suspicious/noExplicitAny: union-narrowing 누적 객체 — 아래에서 경계 캐스팅
  const openGraph: Record<string, any> = {}
  // biome-ignore lint/suspicious/noExplicitAny: 위와 동일
  const twitter: Record<string, any> = {}
  const ios: { url?: string; app_store_id?: string; app_name?: string } = {}
  const android: { url?: string; package?: string; app_name?: string } = {}
  const ogAlternateLocale: string[] = []
  const articleAuthors: string[] = []
  const articleTags: string[] = []
  let ogImage: OgImage | undefined
  let twImage: { url: string; alt?: string } | undefined

  for (const m of tags.meta as SeoMeta[]) {
    if (m.name) {
      switch (m.name) {
        case 'description':
          metadata.description = m.content
          break
        case 'keywords':
          metadata.keywords = m.content
          break
        case 'robots':
          metadata.robots = robotsOverride ?? m.content
          break
        case 'twitter:card':
          twitter.card = m.content
          break
        case 'twitter:title':
          twitter.title = m.content
          break
        case 'twitter:description':
          twitter.description = m.content
          break
        case 'twitter:image':
          twImage = { ...twImage, url: m.content }
          break
        case 'twitter:image:alt':
          if (twImage) twImage.alt = m.content
          break
      }
      continue
    }
    if (!m.property) continue
    switch (m.property) {
      case 'og:title':
        openGraph.title = m.content
        break
      case 'og:description':
        openGraph.description = m.content
        break
      case 'og:type':
        openGraph.type = m.content
        break
      case 'og:url':
        openGraph.url = m.content
        break
      case 'og:site_name':
        openGraph.siteName = m.content
        break
      case 'og:locale':
        openGraph.locale = m.content
        break
      case 'og:locale:alternate':
        ogAlternateLocale.push(m.content)
        break
      case 'og:image':
        ogImage = { url: m.content }
        break
      case 'og:image:type':
        if (ogImage) ogImage.type = m.content
        break
      case 'og:image:width':
        if (ogImage) ogImage.width = Number(m.content)
        break
      case 'og:image:height':
        if (ogImage) ogImage.height = Number(m.content)
        break
      case 'og:image:alt':
        if (ogImage) ogImage.alt = m.content
        break
      case 'article:published_time':
        openGraph.publishedTime = m.content
        break
      case 'article:modified_time':
        openGraph.modifiedTime = m.content
        break
      case 'article:author':
        articleAuthors.push(m.content)
        break
      case 'article:section':
        openGraph.section = m.content
        break
      case 'article:tag':
        articleTags.push(m.content)
        break
      case 'al:ios:app_store_id':
        ios.app_store_id = m.content
        break
      case 'al:ios:app_name':
        ios.app_name = m.content
        break
      case 'al:ios:url':
        ios.url = m.content
        break
      case 'al:android:package':
        android.package = m.content
        break
      case 'al:android:app_name':
        android.app_name = m.content
        break
      case 'al:android:url':
        android.url = m.content
        break
      // og:logo 등 Next `Metadata` 에 대응 필드가 없는 property 메타는 의도적으로 누락한다 —
      // Next 의 `other` 는 `name=` 으로만 렌더해 property 메타를 재현할 수 없고, 해당 정보는
      // JSON-LD(publisher Organization.logo)로 이미 커버된다.
    }
  }

  if (ogImage) openGraph.images = [ogImage]
  if (ogAlternateLocale.length > 0) {
    openGraph.alternateLocale = ogAlternateLocale
  }
  if (articleAuthors.length > 0) openGraph.authors = articleAuthors
  if (articleTags.length > 0) openGraph.tags = articleTags
  if (Object.keys(openGraph).length > 0) {
    metadata.openGraph = openGraph as Metadata['openGraph']
  }

  if (twImage) twitter.images = [twImage]
  if (Object.keys(twitter).length > 0) {
    metadata.twitter = twitter as Metadata['twitter']
  }

  // appLinks: app 아이덴티티는 url 없이도 site 차원에서 emit 한다. Next 의 AppLinksApple 은 url 을
  // 필수로 요구하지만 런타임은 존재하는 키만 렌더하므로, 경계에서 한 번 캐스팅해 엔진 출력을 그대로 보존.
  const appLinks: { ios?: typeof ios; android?: typeof android } = {}
  if (Object.keys(ios).length > 0) appLinks.ios = ios
  if (Object.keys(android).length > 0) appLinks.android = android
  if (appLinks.ios || appLinks.android) {
    metadata.appLinks = appLinks as Metadata['appLinks']
  }

  const languages: Record<string, string> = {}
  let canonical: string | undefined
  const icons: { icon?: string; shortcut?: string; apple?: string } = {}
  for (const l of tags.link as SeoLink[]) {
    switch (l.rel) {
      case 'canonical':
        canonical = l.href
        break
      case 'alternate':
        if (l.hreflang) languages[l.hreflang] = l.href
        break
      case 'icon':
        icons.icon = l.href
        break
      case 'shortcut icon':
        icons.shortcut = l.href
        break
      case 'apple-touch-icon':
        icons.apple = l.href
        break
    }
  }
  if (canonical || Object.keys(languages).length > 0) {
    metadata.alternates = {
      canonical,
      languages: Object.keys(languages).length > 0 ? languages : undefined,
    }
  }
  if (Object.keys(icons).length > 0) metadata.icons = icons

  return metadata
}

// Next 소비처가 SITE/페이지 입력을 조립할 때 필요한 metadata 타입 재노출 —
// `@coldsurf/shared-utils/next` 한 곳에서 끝나게 (icons 는 `SiteConfig` 안에 포함).
export type {
  ArticleMeta,
  JsonLd,
  JsonLdEvent,
  JsonLdEventOffer,
  JsonLdWork,
  Lang,
  PageSeoInput,
  SeoImage,
  SiteConfig,
} from './metadata'
