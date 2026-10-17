import { getLLMText } from '@/lib/llm-text'
import { source } from '@/lib/source'

export const revalidate = false

/** 사이트 전체를 한 파일로 — 링크를 따라갈 수 없는 에이전트에게 컨텍스트로 통째로 넘기는 자리. */
export async function GET() {
  const pages = await Promise.all(source.getPages().map(getLLMText))

  return new Response(pages.join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
