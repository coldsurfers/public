import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/shared'
import { source } from '@/lib/source'

export const revalidate = false

/**
 * `sitemap.xml`. 정적 내보내기라 빌드 산출물로 떨어진다 — 서버 런타임이 관여하지 않는다.
 *
 * 문서 페이지 목록은 `source` 가 정본이라 **여기 경로를 옮겨 적지 않는다.** 페이지를 더하면
 * sitemap 이 따라오고, 지우면 같이 사라진다. `trailingSlash: true` 라 주소 끝의 `/` 도 맞춘다.
 *
 * `.txt` 사본은 넣지 않는다. sitemap 은 색인할 문서를 알리는 자리고, 같은 내용의 평문을
 * 나란히 올리면 중복이다 — LLM 쪽 진입점은 `/llms.txt` 가 따로 맡는다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, priority: 1 },
    ...source.getPages().map((page) => ({
      url: `${siteUrl}${page.url}/`,
      priority: page.slugs.length === 0 ? 0.9 : 0.8,
    })),
  ]
}
