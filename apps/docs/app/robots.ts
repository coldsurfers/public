import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/shared'

export const revalidate = false

/**
 * `robots.txt`. sitemap 과 짝이다 — 크롤러가 여기서 `sitemap.xml` 주소를 줍는다.
 *
 * 막을 게 없어서 전부 연다. 이 사이트에 비공개 경로가 없고, `.txt` 사본도 같은 내용의
 * 다른 표현이라 숨길 이유가 없다.
 *
 * `<Sitemap>` 이 절대 주소라 `siteUrl` 을 쓴다 — `wrangler.jsonc` 의 `routes` 와 같은 값이다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
