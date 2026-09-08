import { describe, expect, it } from 'vitest'
import { buildSeoTags, type SiteConfig } from './metadata'
import { buildSeoScripts, createNextMetadata, type NextMetadataInput } from './next'

const SITE: SiteConfig = {
  name: 'COLDSURF',
  baseUrl: 'https://blog.coldsurf.io',
  keywords: ['공연', 'indie'],
  defaultImage: { path: '/og.png', width: 1200, height: 630, alt: 'COLDSURF' },
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  publisher: {
    name: 'COLDSURF',
    url: 'https://coldsurf.io',
    sameAs: ['https://coldsurf.io'],
  },
  editor: { name: 'imcoldsurf' },
  appLinks: {
    ios: { appStoreId: '1632802589', appName: 'COLDSURF' },
    android: { packageName: 'com.fstvllife.android', appName: 'COLDSURF' },
  },
}

const seo = createNextMetadata(SITE)

const basePage: NextMetadataInput = {
  title: 'About',
  description: 'About COLDSURF',
  path: '/about',
  lang: 'ko',
}

describe('createNextMetadata — flat SeoTags → nested Metadata', () => {
  it('maps title/description/keywords/robots', () => {
    const m = seo(basePage)
    expect(m.title).toBe('About | COLDSURF')
    expect(m.description).toBe('About COLDSURF')
    expect(m.keywords).toBe('공연, indie')
    expect(m.robots).toBe('index, follow')
  })

  it('maps openGraph (website) fields', () => {
    const m = seo(basePage)
    expect(m.openGraph).toMatchObject({
      title: 'About | COLDSURF',
      description: 'About COLDSURF',
      type: 'website',
      url: 'https://blog.coldsurf.io/about',
      siteName: 'COLDSURF',
      locale: 'ko_KR',
    })
  })

  it('maps default image into openGraph.images and twitter.images', () => {
    const m = seo(basePage)
    expect(m.openGraph?.images).toEqual([
      {
        url: 'https://blog.coldsurf.io/og.png',
        width: 1200,
        height: 630,
        alt: 'COLDSURF',
      },
    ])
    expect(m.twitter?.images).toEqual([{ url: 'https://blog.coldsurf.io/og.png', alt: 'COLDSURF' }])
    // 1200x630 is wide enough → summary_large_image.
    // `card` lives on Twitter's discriminated union — read through a loose view in the test.
    expect((m.twitter as { card?: string }).card).toBe('summary_large_image')
  })

  it('maps canonical + hreflang alternates', () => {
    const m = seo({
      ...basePage,
      alternates: [
        { lang: 'ko', path: '/about' },
        { lang: 'en', path: '/en/about' },
      ],
    })
    expect(m.alternates?.canonical).toBe('https://blog.coldsurf.io/about')
    expect(m.alternates?.languages).toMatchObject({
      ko: 'https://blog.coldsurf.io/about',
      en: 'https://blog.coldsurf.io/en/about',
      'x-default': 'https://blog.coldsurf.io/about',
    })
  })

  it('maps SiteConfig.icons → Metadata.icons', () => {
    const m = seo(basePage)
    expect(m.icons).toEqual({
      icon: 'https://blog.coldsurf.io/icons/favicon.ico',
      shortcut: 'https://blog.coldsurf.io/icons/favicon.ico',
      apple: 'https://blog.coldsurf.io/icons/apple-touch-icon.png',
    })
  })

  it('maps app links (al:*) → Metadata.appLinks', () => {
    const m = seo({
      ...basePage,
      appLinks: { iosUrl: 'coldsurf://about', androidUrl: 'coldsurf://about' },
    })
    expect(m.appLinks?.ios).toMatchObject({
      app_store_id: '1632802589',
      app_name: 'COLDSURF',
      url: 'coldsurf://about',
    })
    expect(m.appLinks?.android).toMatchObject({
      package: 'com.fstvllife.android',
      app_name: 'COLDSURF',
      url: 'coldsurf://about',
    })
  })

  it('applies robots override (noindex routes)', () => {
    const m = seo({ ...basePage, robots: 'noindex, nofollow' })
    expect(m.robots).toBe('noindex, nofollow')
  })
})

describe('createNextMetadata — article with multiple authors', () => {
  const articlePage: NextMetadataInput = {
    title: 'Some Post',
    description: 'A post',
    path: '/log/some-post',
    lang: 'ko',
    article: {
      publishedTime: '2026-01-01T00:00:00.000Z',
      author: ['Writer A', 'Writer B'],
      section: 'reviews',
      tags: ['indie', 'live'],
    },
  }

  it('switches og:type to article and folds article fields into openGraph', () => {
    const m = seo(articlePage)
    expect((m.openGraph as { type?: string }).type).toBe('article')
    expect(m.openGraph).toMatchObject({
      publishedTime: '2026-01-01T00:00:00.000Z',
      section: 'reviews',
      authors: ['Writer A', 'Writer B'],
      tags: ['indie', 'live'],
    })
  })

  it('emits one article:author meta per writer in the flat engine', () => {
    const tags = buildSeoTags(articlePage, SITE)
    const authors = tags.meta.filter((t) => t.property === 'article:author')
    expect(authors.map((a) => a.content)).toEqual(['Writer A', 'Writer B'])
  })
})

describe('buildSeoScripts — JSON-LD injection helper (§3-5 path A)', () => {
  it('returns the ld+json innerHTML strings for the page descriptors', () => {
    const scripts = buildSeoScripts(
      {
        title: 'Some Post',
        description: 'A post',
        path: '/log/some-post',
        lang: 'ko',
        article: {
          publishedTime: '2026-01-01T00:00:00.000Z',
          author: ['Writer A', 'Writer B'],
        },
        jsonLd: [{ type: 'WebSite' }, { type: 'Article' }],
      },
      SITE,
    )
    expect(scripts).toHaveLength(1)
    const graph = JSON.parse(scripts[0])
    expect(graph['@context']).toBe('https://schema.org')
    const types = graph['@graph'].map((node: { '@type': string }) => node['@type'])
    expect(types).toContain('WebSite')
    expect(types).toContain('BlogPosting')
    expect(types).toContain('Organization')
  })

  it('returns an empty array when the page has no jsonLd descriptors', () => {
    expect(buildSeoScripts(basePage, SITE)).toEqual([])
  })
})

describe('buildSeoTags — multiple authors in JSON-LD (no editor)', () => {
  it('emits Person[] author when site has no editor', () => {
    const { editor, ...siteNoEditor } = SITE
    const tags = buildSeoTags(
      {
        title: 'Post',
        description: 'desc',
        path: '/log/post',
        article: {
          publishedTime: '2026-01-01T00:00:00.000Z',
          author: ['Writer A', 'Writer B'],
        },
        jsonLd: [{ type: 'Article' }],
      },
      siteNoEditor,
    )
    const graph = JSON.parse(tags.script[0].innerHTML)
    const article = graph['@graph'].find((n: { '@type': string }) => n['@type'] === 'BlogPosting')
    expect(article.author).toEqual([
      { '@type': 'Person', name: 'Writer A' },
      { '@type': 'Person', name: 'Writer B' },
    ])
  })
})
