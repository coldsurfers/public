import { notFound } from 'next/navigation'
import { getLLMText } from '@/lib/llm-text'
import { llmSegments, pageSlugsFromLLMSegments, source } from '@/lib/source'

export const revalidate = false

export async function GET(_req: Request, { params }: RouteContext<'/llms/[...slug]'>) {
  const { slug } = await params
  const page = source.getPage(pageSlugsFromLLMSegments(slug))
  if (!page) notFound()

  return new Response(await getLLMText(page), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: llmSegments(page) }))
}
