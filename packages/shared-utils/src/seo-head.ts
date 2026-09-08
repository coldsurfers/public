// `buildSeoTags` 의 `SeoTags` 출력을 head-descriptor 라우터용 `{ meta, links, scripts }` 로 매핑한다.
// 프레임워크 의존 0 — react 를 import 하지 않는다(그래서 진입점 이름도 `./seo-head` 다).

import {
  buildSeoTags,
  type PageSeoInput,
  type SeoLink,
  type SeoMeta,
  type SeoScript,
  type SiteConfig,
} from './metadata'

export type HeadMeta =
  | { title: string }
  | { charSet: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { httpEquiv: string; content: string }

export type HeadLink = {
  rel: string
  href: string
  hreflang?: string
  type?: string
  sizes?: string
}

export type HeadScript = {
  children?: string
  src?: string
  type?: string
  async?: boolean
}

export type SeoHead = {
  meta: HeadMeta[]
  links: HeadLink[]
  scripts: HeadScript[]
}

/** `PageSeoInput` + `robots` override. 미지정 시 엔진 기본값 `'index, follow'`. */
export type SeoHeadInput = PageSeoInput & { robots?: string }

/**
 * `SiteConfig` 를 한 번 바인딩해, 라우트에서 단일 declarative 입력으로 호출하는 `seoHead(input)` 를 만든다.
 *
 *   // app 진입 1회
 *   export const seoHead = createSeoHead({ ...SITE, baseUrl })
 *
 *   // 라우트
 *   head: ({ match }) => seoHead({ path: '/about', lang: match.context.lang, title, description })
 *   head: () => seoHead({ path: '/resume', lang: 'ko', ...copy, robots: 'noindex, nofollow' })
 *
 * 반환값(`{ meta, links, scripts }`)을 라우터가 `<head>` 로 직렬화한다.
 */
export function createSeoHead(site: SiteConfig): (input: SeoHeadInput) => SeoHead {
  return (input) => {
    const { robots, ...page } = input
    const tags = buildSeoTags(page, site)

    const meta: HeadMeta[] = [{ title: tags.title }]
    for (const m of tags.meta as SeoMeta[]) {
      if (m.name) {
        // robots override — noindex 라우트만 명시.
        const content = m.name === 'robots' && robots ? robots : m.content
        meta.push({ name: m.name, content })
      } else if (m.property) {
        meta.push({ property: m.property, content: m.content })
      }
      // name 도 property 도 없는 SeoMeta 는 spec 위반 — skip.
    }

    const links: HeadLink[] = (tags.link as SeoLink[]).map((l) => ({
      rel: l.rel,
      href: l.href,
      ...(l.hreflang ? { hreflang: l.hreflang } : {}),
    }))

    const scripts: HeadScript[] = (tags.script as SeoScript[]).map((s) => ({
      type: s.type,
      children: s.innerHTML,
    }))

    return { meta, links, scripts }
  }
}

// app code 가 `seoHead` 입력을 조립할 때 필요한 metadata 타입 재노출 — `@coldsurf/shared-utils/react`
// 한 곳에서 끝나게.
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
