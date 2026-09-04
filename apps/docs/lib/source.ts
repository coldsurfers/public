import { loader } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineDocs } from 'fumadocs-mdx/macro'
import { docsContentRoute, docsRoute } from './shared'

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true },
  },
  meta: { schema: metaSchema },
})

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [],
})

/**
 * 페이지 하나의 평문 사본이 사는 경로 — `/llms/components/badge.txt`.
 *
 * 마지막 세그먼트에 확장자를 붙이는 게 핵심이다. 정적 내보내기는 확장자가 없으면 디렉터리
 * (`.../badge/index.html`)로 떨어뜨리는데, 그러면 `.txt` 한 방에 못 가져간다.
 * 루트 문서는 슬러그가 비어 있어 `index` 로 대신한다.
 */
export function llmSegments(page: (typeof source)['$inferPage']) {
  const slugs = page.slugs.length > 0 ? page.slugs : ['index']
  const head = slugs.slice(0, -1)
  const tail = slugs[slugs.length - 1]

  return [...head, `${tail}.txt`]
}

/** `llmSegments` 의 역. 라우트 핸들러가 슬러그를 되찾을 때 쓴다. */
export function pageSlugsFromLLMSegments(segments: string[]) {
  const head = segments.slice(0, -1)
  const tail = segments[segments.length - 1]?.replace(/\.txt$/, '')

  if (tail === 'index' && head.length === 0) return []
  return tail ? [...head, tail] : head
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = llmSegments(page)

  return {
    segments,
    url: `/${[page.locale, ...docsContentRoute.split('/'), ...segments].filter(Boolean).join('/')}`,
  }
}
