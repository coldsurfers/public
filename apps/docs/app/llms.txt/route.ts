import { llms } from 'fumadocs-core/source'
import { getPageMarkdownUrl, source } from '@/lib/source'

export const revalidate = false

export function GET() {
  return new Response(withPlainTextLinks(llms(source).index()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

/**
 * 색인의 링크를 HTML 페이지가 아니라 평문 사본(`/llms/components/badge.txt`)으로 돌린다.
 *
 * `llms()` 는 `node.url` 을 그대로 쓰고 그걸 바꿀 훅이 없다. 그런데 llms.txt 를 읽는 쪽은
 * 링크를 따라가서 **본문**을 가져가는 게 목적이라, `/docs/...` 를 주면 마크업을 준 셈이 된다.
 * 그래서 페이지 목록으로 정확한 치환표를 만들어 갈아끼운다 — 문자열 추측이 아니라 1:1 대응이다.
 */
function withPlainTextLinks(index: string) {
  let out = index

  for (const page of source.getPages()) {
    out = out.replaceAll(`](${page.url})`, `](${getPageMarkdownUrl(page).url})`)
  }

  return out
}
